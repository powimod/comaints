
import assert from 'assert';

import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';
import { controlObject } from '../../../common/src/objects/object-util.mjs';
import userObjectDef from '../../../common/src/objects/user-object-def.mjs';


class UserController {
    static #instance = null;

    #model = null;
    #userModel = null;

    constructor() {
        if (UserController.#instance !== null)
            throw new Error("Can not instanciate UserController. Use UserController.getInstance()");
    }

    static getInstance() {
        if (! UserController.#instance)
            UserController.#instance = new UserController();
        return UserController.#instance;
    }

    initialize(config) {
        this.#model = ModelSingleton.getInstance();
        this.#userModel = this.#model.getUserModel();
    }

    async findUserList(properties, filters, pagination, view) {
        assert(properties !== undefined);
        assert(filters !== undefined);
        assert(pagination !== undefined);
        assert(view !== undefined);

        try {
            const result = await this.#userModel.findUserList(properties, filters, pagination);
            view.json(result);
        }
        catch(error) {
            view.error(error);
        }
    }

    async createUser(user, view) {
        assert(user !== undefined);
        assert(view !== undefined);

        try {
            const [ errorMsg, errorParam ] = controlObject(userObjectDef, user, { fullCheck:true, checkId:false });
            if (errorMsg)
                throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);

            user = await this.#userModel.createUser(user);

            // delete protected properties
            delete user.companyId;
            delete user.password;
            delete user.state;
            delete user.lastUse;
            delete user.authAction;
            delete user.authData;
            delete user.authCode;
            delete user.authExpiration;
            delete user.authAttempts;


            view.json({user});
        }
        catch(error) {
            view.error(error);
        }
    }

    async getUserById(userId, view, controlAccess) {
        assert(userId !== undefined);
        assert(view !== undefined);
        assert(controlAccess !== undefined);
        try {
            let user = await this.#userModel.getUserById(userId);
            if (user && ! controlAccess(user))
                user = null;
            view.json({user});
        }
        catch(error) {
            console.log(error);
            view.error(error);
        }
    }

    async editUser(user, view, controlAccess) {
        assert(user !== undefined);
        assert(view !== undefined);
        assert(controlAccess !== undefined);

        try {
            const [ errorMsg, errorParam ] = controlObject(userObjectDef, user, { fullCheck:true, checkId:false });
            if (errorMsg)
                throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);
            let controlUser = await this.#userModel.getUserById(user.id);
            if (controlUser && ! controlAccess(controlUser))
                throw new ComaintApiErrorUnauthorized('error.not_owner');
            user = await this.#userModel.editUser(user);
            view.json({user});
        }
        catch(error) {
            view.error(error);
        }
    }

    async deleteUserById(userId, view, controlAccess) {
        assert(userId !== undefined);
        assert(view !== undefined);
        try {
            let user = await this.#userModel.getUserById(userId);
            if (user === null)
                throw new ComaintApiErrorUnauthorized('error.not_found');
            if (! controlAccess(user))
                throw new ComaintApiErrorUnauthorized('error.not_owner');
            const deleted = await this.#userModel.deleteUserById(userId);
            view.json({deleted});
        }
        catch(error) {
            view.error(error);
        }
    }
}



export default UserController;
