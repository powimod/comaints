

import assert from 'assert';
import jwt from 'jsonwebtoken';

import ModelSingleton from './model.js';

import { ComaintApiError, ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized,
    ComaintApiErrorInvalidToken, ComaintApiErrorExpiredToken  } from '../../../common/src/error.mjs';
import { AccountState } from '../../../common/src/global.mjs';
import MailManagerSingleton from '../MailManager.js';

const AUTH_OPERATION_REGISTER = 'register';
const AUTH_OPERATION_UNLOCK = 'unlock';
const AUTH_OPERATION_CHANGE_EMAIL = 'change-email';
const AUTH_OPERATION_ACCOUNT_DELETION = 'account-deletion';
const AUTH_OPERATION_RESET_PASSWORD = 'reset-password';

class AuthModel {
    #userModel = null;
    #tokenModel = null;
    #companyModel = null;
    #tokenSecret = null;
    #codeValidityPeriod = null;
    #maxAuthAttempts = null;
    #refreshTokenLifespan = null;
    #accessTokenLifespan = null;

    initialize (_, securityConfig) {
        assert(securityConfig !== undefined);

        // check «security» configuration section
        const securityParameterNames = [ 'tokenSecret', 'refreshTokenLifespan' , 'accessTokenLifespan'];
        for (const parameterName of securityParameterNames ) {
            if (securityConfig[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined is security configuration`);
        }

        this.#tokenSecret = securityConfig.tokenSecret;
        this.#codeValidityPeriod  = securityConfig.codeValidityPeriod;
        this.#maxAuthAttempts = securityConfig.maxAuthAttempts;
        this.#refreshTokenLifespan = securityConfig.refreshTokenLifespan;
        this.#accessTokenLifespan = securityConfig.accessTokenLifespan;

        const model  = ModelSingleton.getInstance();
        this.#userModel = model.getUserModel();
        this.#tokenModel = model.getTokenModel();
        this.#companyModel = model.getCompanyModel();
        assert(this.#companyModel !== null);
    }

    generateRandomAuthCode() {
        const minimum = 10000;
        const maximum = 99999;
        const authCode = parseInt(Math.random() * (maximum - minimum) + minimum);
        console.log(`Validation code is ${ authCode }`); // TODO remove this
        return authCode;
    }


    async register(email, password, authCode, invalidateCodeImmediately) {
        const authAction = AUTH_OPERATION_REGISTER;
        const authAttempts = 0;
        const codeValidityPeriod = invalidateCodeImmediately ? 0 : this.#codeValidityPeriod;
        const authExpiration = new Date(Date.now() + codeValidityPeriod * 1000);

        let user = await this.#userModel.getUserByEmail(email);
        if (user !== null) {
            // case where user already exists
            assert(user.state === AccountState.PENDING); // already checked in authRoute
            // update user registration
            user = await this.#userModel.editUser({
                id: user.id,
                manager: true,
                password,
                state: AccountState.PENDING,
                authCode,
                authAction,
                authExpiration,
                authAttempts
            });
        }
        else {
            // case where user does not exist
            user = await this.#userModel.createUser({
                email,
                manager: true,
                password,
                state: AccountState.PENDING,
                authCode,
                authAction,
                authExpiration,
                authAttempts
            });
        }
        return { user };
    }


    async checkAuthCode(userId, authCode) {
        assert(userId !== undefined);
        assert(authCode !== undefined);
        let user = await this.#userModel.getUserById(userId);
        if (user === null)
            throw new Error('User not found');
        if (user.state === AccountState.DISABLED)
            throw new ComaintApiErrorUnauthorized('error.account_disabled');
        const now = new Date();
        if (user.authExpiration < now)
            throw new ComaintApiErrorUnauthorized('error.expired_code');

        const validated = await this.#userModel.checkAuthCode(userId, authCode);
        if (! validated) {
            assert(! isNaN(user.authAttempts));
            user.authAttempts++;
            if (user.authAttempts >= this.#maxAuthAttempts) {
                user.state = AccountState.LOCKED;
                user.authCode = null;
                user.authAction = null;
                user.authData = null;
                user.authExpiration = null;
                user.authAttempts = null;
            }
            delete user.password; // do not re-encrypt already encrypted password !
            await this.#userModel.editUser(user);
            return false;
        }
        return true;
    }

    async processAuthOperation(userId) {
        assert(userId !== undefined);
        let user = await this.#userModel.getUserById(userId);
        if (user === null)
            throw new Error('User not found');
        const action = user.authAction;
        switch (action) {
            case AUTH_OPERATION_REGISTER :
                if (user.state !== AccountState.PENDING)
                    throw new ComaintApiError('error.account_already_registered');
                user.state = AccountState.ACTIVE;
                break;
            case AUTH_OPERATION_UNLOCK :
                if (user.state !== AccountState.LOCKED)
                    throw new ComaintApiError('error.account_not_locked');
                user.state = AccountState.ACTIVE;
                break;
            case AUTH_OPERATION_CHANGE_EMAIL :
                user.email = user.authData;
                break;
            case AUTH_OPERATION_ACCOUNT_DELETION :
                const companyId = user.companyId;
                await this.#userModel.deleteUserById(user.id);
                user = null;
                if (companyId !== null) {
                    try {
                        await this.#companyModel.deleteCompanyById(companyId);
                    }
                    catch (error) {
                        // ignore errors can_not_delete_company_with_managers
                        console.log('Company not deleted');
                    }
                }
                break;
            case AUTH_OPERATION_RESET_PASSWORD:
                const data = JSON.parse(user.authData);
                await this.#userModel.changePasswordHash(data.email, data.passwordHash);
                break;
            default:
                throw new Error(`Invalid action «${action}»`);
        }
        if (user !== null) {
            user.authCode = null;
            user.authAction = null;
            user.authData = null;
            user.authExpiration = null;
            user.authAttempts = null;
            delete user.password; // do not re-encrypt already encrypted password !
            await this.#userModel.editUser(user);
        }
        return user;
    }

    async changeAuthCode(userId, newAuthCode) {
        assert(userId !== undefined);
        let user = await this.#userModel.getUserById(userId);
        if (user === null)
            throw new Error('User not found');
        if (user.authAction === null)
            throw new ComaintApiErrorInvalidRequest('error.no_auth_in_progress');
        user.authCode = newAuthCode;
        delete user.password; // do not re-encrypt already encrypted password !
        await this.#userModel.editUser(user);
    }

    async sendRegisterAuthCode(code, email, i18n_t) {
        assert(code   !== undefined && typeof(code)   === 'number');
        assert(email  !== undefined && typeof(email)  === 'string');
        assert(i18n_t !== undefined && typeof(i18n_t) === 'function');
        const subject  = i18n_t('register.mail_title');
        const textBody = i18n_t('register.mail_body', { 'code' : code });
        const htmlBody = i18n_t('register.mail_body', { 'code' : `<b>${code}</b>` });
        const mailManager = MailManagerSingleton.getInstance();
        return await mailManager.sendMail(email, subject, textBody, htmlBody);
    }

    async sendChangeEmailAuthCode(code, email, newEmail, i18n_t) {
        assert(code      !== undefined && typeof(code)      === 'number');
        assert(email     !== undefined && typeof(email)     === 'string');
        assert(newEmail  !== undefined && typeof(newEmail)  === 'string');
        assert(i18n_t    !== undefined && typeof(i18n_t)    === 'function');
        const subject  = i18n_t('change_email.mail_title');
        const textBody = i18n_t('change_email.mail_body', { 'code' : code });
        const htmlBody = i18n_t('change_email.mail_body', { 'code' : `<b>${code}</b>` });
        const mailManager = MailManagerSingleton.getInstance();
        return await mailManager.sendMail(email, subject, textBody, htmlBody);
    }

    async sendAccountDeletionAuthCode(code, email, i18n_t) {
        assert(code   !== undefined && typeof(code)   === 'number');
        assert(email  !== undefined && typeof(email)  === 'string');
        assert(i18n_t !== undefined && typeof(i18n_t) === 'function');
        const subject  = i18n_t('account_deletion.mail_title');
        const textBody = i18n_t('account_deletion.mail_body', { 'code' : code });
        const htmlBody = i18n_t('account_deletion.mail_body', { 'code' : `<b>${code}</b>` });
        const mailManager = MailManagerSingleton.getInstance();
        return await mailManager.sendMail(email, subject, textBody, htmlBody);
    }

    async sendUnlockAccountAuthCode(code, email, i18n_t) {
        assert(code   !== undefined && typeof(code)   === 'number');
        assert(email  !== undefined && typeof(email)  === 'string');
        assert(i18n_t !== undefined && typeof(i18n_t) === 'function');
        const subject  = i18n_t('unlock_account_email.mail_title');
        const textBody = i18n_t('unlock_account_email.mail_body', { 'code' : code });
        const htmlBody = i18n_t('unlock_account_email.mail_body', { 'code' : `<b>${code}</b>` });
        const mailManager = MailManagerSingleton.getInstance();
        return await mailManager.sendMail(email, subject, textBody, htmlBody);
    }

    async sendResetPasswordAuthCode(code, email, i18n_t) {
        assert(code   !== undefined && typeof(code)   === 'number');
        assert(email  !== undefined && typeof(email)  === 'string');
        assert(i18n_t !== undefined && typeof(i18n_t) === 'function');
        const subject  = i18n_t('reset_password.mail_title');
        const textBody = i18n_t('reset_password.mail_body', { 'code' : code });
        const htmlBody = i18n_t('reset_password.mail_body', { 'code' : `<b>${code}</b>` });
        const mailManager = MailManagerSingleton.getInstance();
        return await mailManager.sendMail(email, subject, textBody, htmlBody);
    }

    async sendExistingEmailAlertMessage(email, i18n_t) {
        assert(email  !== undefined && typeof(email)  === 'string');
        assert(i18n_t !== undefined && typeof(i18n_t) === 'function');
        const subject  = i18n_t('register_attempt_with_used_email.mail_title');
        const textBody = i18n_t('register_attempt_with_used_email.mail_body');
        const htmlBody = i18n_t('register_attempt_with_used_email.mail_body');
        const mailManager = MailManagerSingleton.getInstance();
        return await mailManager.sendMail(email, subject, textBody, htmlBody);
    }

    generateAccessToken(userId, companyId, administrator, refreshTokenId, connected) {
        assert(userId !== undefined);
        assert(companyId !== undefined);
        assert(administrator !== undefined);
        assert(refreshTokenId !== undefined);
        assert(connected !== undefined);
        assert(this.#tokenSecret !== undefined);
        assert(this.#accessTokenLifespan !== undefined);
        const payload = {
            type: 'access',
            user_id: userId,
            connected: connected,
            administrator: administrator,
            company_id: companyId,
            refresh_token_id: refreshTokenId
        };
        return jwt.sign(payload, this.#tokenSecret, {
            expiresIn: `${this.#accessTokenLifespan}s` // seconds
        });
    }


    async checkAccessToken(token, expiredAccessTokenEmulation = false) {

        const decodeAccessTokenPromise = new Promise( (resolve, reject) => {

            // ignore expiration
            jwt.verify(token, this.#tokenSecret, { ignoreExpiration: true }, (err, payload) => {
                if (err !== null)  {
                    reject('Invalid token');
                    return;
                }

                // do not generate an error if token is expired
                let expired = payload.exp * 1000 < Date.now();
                if (expiredAccessTokenEmulation)
                    expired = true;

                if (payload.type !== 'access') {
                    reject('Not an access token');
                    return;
                }
                const userId = payload.user_id;
                if (isNaN(userId)) {
                    reject(`Invalid token content`);
                    return;
                }
                const companyId = payload.company_id;
                if (isNaN(companyId )) {
                    reject(`Invalid token content`);
                    return;
                }
                const refreshTokenId = payload.refresh_token_id;
                if (isNaN(refreshTokenId )) {
                    reject(`Invalid token content`);
                    return;
                }
                const connected = payload.connected;
                if (connected !== true && connected !== false) {
                    reject(`Invalid token content`);
                    return;
                }
                const administrator = payload.administrator;
                if (administrator !== true && administrator !== false) {
                    reject(`Invalid token content A`);
                    return;
                }

                resolve([expired, userId, companyId, refreshTokenId, connected, administrator ]);
            });
        });

        let expired, userId, companyId, refreshTokenId, connected, administrator;
        try {
            [ expired, userId, companyId, refreshTokenId, connected, administrator ] = await decodeAccessTokenPromise;
        }
        catch (error) {
            console.log("Access token error", error.message);
            throw new ComaintApiErrorInvalidToken();
        }

        if (expired)
            throw new ComaintApiErrorExpiredToken();
        return [ userId, companyId, refreshTokenId, connected, administrator ];
    }


    async generateRefreshToken(userId, companyId, connected) {
        assert(companyId !== undefined);
        assert(connected !== undefined);
        assert(typeof(connected) === 'boolean');
        assert(this.#tokenSecret !== undefined);
        assert(this.#refreshTokenLifespan !== undefined);

        const refreshTokenLifespan = this.#refreshTokenLifespan;
        const expiresAt = new Date (Date.now() + refreshTokenLifespan * 86400000); // 24 hours in ms
        const token = await this.#tokenModel.createToken({ userId, expiresAt });
        const tokenId = token.id;

        const payload = {
            type: 'refresh',
            token_id: tokenId,
            user_id: userId,
            company_id: companyId,
            connected: connected
        };
        const jwtToken = jwt.sign(payload, this.#tokenSecret, { expiresIn: `${refreshTokenLifespan}days` });
        return [ jwtToken, tokenId ];
    }

    async checkRefreshToken(token, expiredRefreshTokenEmulation = false) {
        const expiredTokenErrorMessage = "Expired refresh token";
        const decodeRefreshTokenPromise = new Promise( (resolve, reject) => {
            if (expiredRefreshTokenEmulation){
                reject(expiredTokenErrorMessage);
                return;
            }
            jwt.verify(token, this.#tokenSecret, (err, payload) => {
                if (err !== null)  {
                    if (err.constructor.name === 'TokenExpiredError')
                        reject(expiredTokenErrorMessage);
                    else
                        reject('Invalid token');
                    return;
                }
                if (payload.type !== 'refresh') {
                    reject('Not an refresh token');
                    return;
                }
                if (isNaN(payload.token_id) || isNaN(payload.user_id)) {
                    reject(`Invalid token content`);
                    return;
                }
                resolve([payload.token_id, payload.user_id, payload.connected, payload.company_id]);
            });
        });

        let tokenId, userId, companyId, connected;
        try {
            [tokenId, userId, connected, companyId] = await decodeRefreshTokenPromise;
        }
        catch(error) {
            throw new ComaintApiErrorInvalidToken();
        }

        assert(tokenId !== undefined);
        assert(userId !== undefined);
        assert(companyId !== undefined);
        assert(connected !== undefined);
        assert(typeof(connected) === 'boolean');

        // token must be present in database to be valid (detect token usurpation)
        token = await this.#tokenModel.getTokenById(tokenId);
        const tokenFound = (token !== null);

        return [tokenFound, tokenId, userId, connected, companyId];
    }


	async lockAccount(userId) {
		assert(this.#userModel !== null);
        await this.#userModel.editUser({
            id: userId,
            state: AccountState.LOCK
        });
	}

    async isAccountLocked(userId) {
		assert(this.#userModel !== null);
        const user = await this.#userModel.getUserById(userId);
        return ( user.state === AccountState.LOCK );
    }


	async deleteRefreshToken(tokenId) {
		assert(this.#tokenModel !== null);
        await this.#tokenModel.deleteTokenById(tokenId);
	}


    async getUserProfileById(userId) {
        return await this.#userModel.getUserById(userId);
    }

    async getUserProfileByEmail(email) {
        return await this.#userModel.getUserByEmail(email);
    }

    async getUserProfileByEmail(email) {
        return await this.#userModel.getUserByEmail(email);
    }

    async login(email, password) {
        const user = await this.#userModel.getUserByEmail(email);
        if (user === null)
            throw new ComaintApiErrorUnauthorized('error.invalid_email_or_password');
        const isPasswordValid = await this.#userModel.checkPassword(user.id, password);
        if (! isPasswordValid) {
            user.authAction = 'login';
            user.authExpiration = null;
            user.authCode = null;
            user.authData = null;
            if (user.authAttempts === null)
                user.authAttempts = 0;
            user.authAttempts++;
            if (user.authAttempts >= this.#maxAuthAttempts) {
                user.state = AccountState.LOCKED;
                user.authAction = null;
                user.authAttempts = null;
            }
            delete user.password; // do not re-encrypt already encrypted password !
            await this.#userModel.editUser(user);
            throw new ComaintApiErrorUnauthorized('error.invalid_email_or_password');
        }

        if (user.authAttempts >= this.#maxAuthAttempts)
            throw new ComaintApiErrorUnauthorized('error.too_many_attempts');

        if (user.state === AccountState.PENDING)
            throw new ComaintApiErrorUnauthorized('error.account_not_registered');
        if (user.state === AccountState.DISABLED)
            throw new ComaintApiErrorUnauthorized('error.account_disabled');
        if (user.state === AccountState.LOCKED)
            throw new ComaintApiErrorUnauthorized('error.account_locked');
        assert (user.state === AccountState.ACTIVE);

        if (user.authAction !== null) {
            user.authAction = null;
            user.authAttempts = 0;
            user.authExpiration = null;
            user.authCode = 0;
            user.authData = null;
            await this.#userModel.editUser(user);
        }
        return user;
    }

    async logout(userId, refreshTokenId) {
        assert(userId !== undefined);
        assert(refreshTokenId !== undefined);
        // userId is not used
        // let user = await this.#userModel.getUserById(userId)
        await this.#tokenModel.deleteTokenById(refreshTokenId);
    }

    async prepareEmailChange(userId, newEmail, authCode, invalidateCodeImmediately) {
        let user = await this.#userModel.getUserById(userId);
        if (user === null)
            throw new Error('User not found');

        if (user.email === newEmail)
            throw new ComaintApiErrorInvalidRequest('error.same_email');

        const otherUser = await this.#userModel.getUserByEmail(newEmail);
        if (otherUser !== null)
            throw new ComaintApiErrorInvalidRequest('error.already_used_email');

        const codeValidityPeriod = invalidateCodeImmediately ? 0 : this.#codeValidityPeriod;
        const authExpiration = new Date(Date.now() + codeValidityPeriod * 1000);

        user.authAction = AUTH_OPERATION_CHANGE_EMAIL;
        user.authExpiration = authExpiration;
        user.authCode = authCode;
        user.authData = newEmail;
        user.authAttempts = 0;

        user = await this.#userModel.editUser(user);
        return user;
    }

    async preparePasswordReset(email, newPassword, authCode, invalidateCodeImmediately) {
        let user = await this.#userModel.getUserByEmail(email);
        if (user === null)
            throw new Error('User not found'); // FIXME should silently ignore

        const codeValidityPeriod = invalidateCodeImmediately ? 0 : this.#codeValidityPeriod;
        const authExpiration = new Date(Date.now() + codeValidityPeriod * 1000);

        const passwordHash = await this.#userModel.encryptPassword(newPassword);

        user.authAction = AUTH_OPERATION_RESET_PASSWORD;
        user.authExpiration = authExpiration;
        user.authCode = authCode;
        user.authData = JSON.stringify({ email, passwordHash: passwordHash});
        user.authAttempts = 0;

        user = await this.#userModel.editUser(user);
        return user;
    }


    async prepareAccountDeletion(userId, authCode, invalidateCodeImmediately) {
        let user = await this.#userModel.getUserById(userId);
        if (user === null)
            throw new Error('User not found');

        const codeValidityPeriod = invalidateCodeImmediately ? 0 : this.#codeValidityPeriod;
        const authExpiration = new Date(Date.now() + codeValidityPeriod * 1000);

        user.authAction = AUTH_OPERATION_ACCOUNT_DELETION;
        user.authExpiration = authExpiration;
        user.authCode = authCode;
        user.authData = null;
        user.authAttempts = 0;

        user = await this.#userModel.editUser(user);
        return user;
    }

    async prepareAccountUnlock(userId) {
        let user = await this.#userModel.getUserById(userId);
        if (user === null)
            throw new Error('User not found');
        if (user.state !== AccountState.LOCKED)
            throw new ComaintApiErrorInvalidRequest('error.account_not_locked');

        throw new Error('Not implemented');
    }

}


class AuthModelSingleton {

    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate AuthModelSingleton!');
    }

    static getInstance() {
        if (! AuthModelSingleton.#instance)
            AuthModelSingleton.#instance = new AuthModel();
        return AuthModelSingleton.#instance;
    }
}

export default AuthModelSingleton;
