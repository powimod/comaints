import assert from 'assert';

import ModelSingleton from '../model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';

const renewTokensMiddleware = async (request) => {
    assert(request);
    const view = request.view;

    const userId = request.userId;
    assert(userId !== null);
    const companyId = request.companyId;
    assert(companyId !== null);
    const refreshTokenId = request.refreshTokenId;
    assert(refreshTokenId !== null);
    const connected = request.userConnected;
    assert(typeof(connected) === 'boolean');

    const model  = ModelSingleton.getInstance();
    const authModel = model.getAuthModel();

    // remove refresh token from database
    console.log(`Delete token ${refreshTokenId} in database`);
    await authModel.deleteRefreshToken(refreshTokenId);

    if (await authModel.isAccountLocked(userId)) {
        console.log(`Token renew - account locked userId = ${userId}`);
        throw new ComaintApiErrorUnauthorized(view.translation('error.account_locked'));
    }

    const user = await authModel.getUserProfileById(userId);
    if (user === null)
        throw new Error('User account does not exist');
    if (companyId !== user.companyId)
        throw new Error('Invalid company ID in refresh token');

    const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId, connected);
    const newAccessToken  = await authModel.generateAccessToken(userId, companyId, user.administrator, newRefreshTokenId, true);

    view.storeRenewedTokens(newAccessToken, newRefreshToken);
};

export default renewTokensMiddleware;
