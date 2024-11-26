'use strict';
import { controlObject } from '../../common/src/objects/object-util.mjs';
import userObjectDef from '../../common/src/objects/user-object-def.mjs';
import { ComaintTranslatedError } from '../../common/src/error.mjs';

class UserApi {

    #context = null;

    constructor(context) {
        this.#context = context;
    }

    async createUser(user) {
        if (typeof(user) !== 'object')
            throw new Error("Argument «user» is not an object");
        const [ errorMsg, errorParams ] = (controlObject(userObjectDef, user, {fullCheck:false}));
        if (errorMsg)
            throw new ComaintTranslatedError(errorMsg, errorParams);
        const CREATE_USER_ROUTE = '/api/v1/user';
        const result = await this.#context.jsonPost(CREATE_USER_ROUTE , { user }, {token:true});
        return result.user;
    }

    async editUser(user) {
        if (typeof(user) !== 'object')
            throw new Error("Argument «user» is not an object");
        const [ errorMsg, errorParams ] = (controlObject(userObjectDef, user, {fullCheck:true}));
        if (errorMsg)
            throw new ComaintTranslatedError(errorMsg, errorParams);
        const EDIT_USER_ROUTE = '/api/v1/user/{{userId}}';
        const route = this.#context.prepareRequestPath(EDIT_USER_ROUTE, { userId: user.id });
        const result = await this.#context.jsonPost(route, { user }, {token:true});
        return result.user;
    }

    async deleteUserById(userId) {
        if (userId === undefined)
            throw new Error("Argument «user» required");
        if (isNaN(userId))
            throw new Error("Argument «user» is not valid");
        const DELETE_USER_ROUTE = '/api/v1/user/{{userId}}/delete';
        const route = this.#context.prepareRequestPath(DELETE_USER_ROUTE, { userId });
        const result = await this.#context.jsonDelete(route, {token:true});
        return result.deleted;
    }

    async listUser(page = 1) {
        const LIST_USER_ROUTE = '/api/v1/user/list';
        const result = await this.#context.jsonGet(LIST_USER_ROUTE , {page}, {token:true});
        return {
            list: result.userList,
            page: result.page,
            count: result.count,
            limit: result.limit
        };
    }

    async getUserById(userId) {
        if (userId === undefined)
            throw new Error("Argument «user» required");
        if (isNaN(userId))
            throw new Error("Argument «user» is not valid");
        const GET_USER_ROUTE = '/api/v1/user/{{userId}}';
        const route = this.#context.prepareRequestPath(GET_USER_ROUTE, { userId });
        const result = await this.#context.jsonGet(route, {}, {token:true});
        return result.user;
    }


}
export default UserApi;
