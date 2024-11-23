'use strict';
import assert from 'assert';

import { buildFieldArrays, controlObject } from '../../../common/src/objects/object-util.mjs';
import tokenObjectDef from '../../../common/src/objects/token-object-def.mjs';

class TokenModel {
    #db = null;

    initialize (db) {
        this.#db = db;
    }

    async findTokenList() {
		let sql = `SELECT * FROM tokens`;
		const result = await this.#db.query(sql);
		const tokenList = [];
		for (let tokenRecord of result)
			tokenList.push(tokenRecord);
		return tokenList;
    }


	async getTokenById(tokenId) {
		if (tokenId === undefined)
			throw new Error('Argument <tokenId> required');
		if (isNaN(tokenId))
			throw new Error('Argument <tokenId> is not a number');
		let sql = `SELECT * FROM tokens WHERE id = ?`;
		const result = await this.#db.query(sql, [tokenId]);
		if (result.length === 0)
			return null;
		const token = result[0];
        // TODO filter properties
		return token;
	}


	async createToken(token) {
        const [ fieldNames, fieldValues ] = buildFieldArrays(tokenObjectDef, token);
        const markArray = Array(fieldValues.length).fill('?').join(',');
		const sqlRequest = `
			INSERT INTO tokens(${fieldNames.join(', ')}) VALUES (${markArray});
		`;
		const result = await this.#db.query(sqlRequest, fieldValues);
		const tokenId = result.insertId;
		token = this.getTokenById(tokenId);
		return token;
    }

    async deleteTokenById(tokenId){
        assert(tokenId !== undefined);
		if (typeof(tokenId) !== 'number')
			throw new Error('Argument <tokenId> is not a number');
		const sql = `DELETE FROM tokens WHERE id = ?`;
		const result = await this.#db.query(sql, [tokenId]);
		return (result.affectedRows !== 0);
    }

}


class TokenModelSingleton {

    static #instance = null;

	constructor() {
		throw new Error('Can not instanciate TokenModelSingleton!');
	}

	static getInstance() {
		if (! TokenModelSingleton.#instance)
			TokenModelSingleton.#instance = new TokenModel();
		return TokenModelSingleton.#instance;
	}
}

export default TokenModelSingleton;
