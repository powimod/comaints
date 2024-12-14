'use strict';
import assert from 'assert';

import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';
import { controlObject } from '../../../common/src/objects/object-util.mjs';
import unitObjectDef from '../../../common/src/objects/unit-object-def.mjs';


class UnitController {
    static #instance = null

    #model = null;
    #unitModel = null;

    constructor() {
        if (UnitController.#instance !== null)
            throw new Error("Can not instanciate UnitController. Use UnitController.getInstance()");
    }

    static getInstance() {
        if (! UnitController.#instance)
            UnitController.#instance = new UnitController();
        return UnitController.#instance;
    }

    initialize(config) {
        this.#model = ModelSingleton.getInstance();
        this.#unitModel = this.#model.getUnitModel();
    }

    async findUnitList(properties, filters, pagination, view) {
        assert(properties !== undefined);
        assert(filters !== undefined);
        assert(pagination !== undefined);
        assert(view !== undefined);

        try {
            const result = await this.#unitModel.findUnitList(properties, filters, pagination);
            view.json(result);
        }
        catch(error) {
            view.error(error);
        }
    }


    async createUnit(unit, view) {
        assert(unit !== undefined);
        assert(view !== undefined);

        try {
            const [ errorMsg, errorParam ] = controlObject(unitObjectDef, unit, { fullCheck:true, checkId:false });
            if (errorMsg)
                throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);

            unit = await this.#unitModel.createUnit(unit);

            // TODO filter protected properties

            view.json({unit});
        }
        catch(error) {
            view.error(error);
        }
    }

    async getUnitById(unitId, view, controlAccess) {
        assert(unitId !== undefined);
        assert(view !== undefined);
        assert(controlAccess !== undefined);
        try {
            let unit = await this.#unitModel.getUnitById(unitId);
            if (unit && ! controlAccess(unit))
                unit = null;
            view.json({unit});
        }
        catch(error) {
            console.log(error)
            view.error(error);
        }
    }

    async editUnit(unit, view, controlAccess) {
        assert(unit !== undefined);
        assert(view !== undefined);
        assert(controlAccess !== undefined);

        try {
            const [ errorMsg, errorParam ] = controlObject(unitObjectDef, unit, { fullCheck:true, checkId:false });
            if (errorMsg)
                throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);
            let controlUnit = await this.#unitModel.getUnitById(unit.id);
            if (controlUnit && ! controlAccess(controlUnit))
                throw new ComaintApiErrorUnauthorized('error.not_owner');
            unit = await this.#unitModel.editUnit(unit);
            view.json({unit});
        }
        catch(error) {
            view.error(error);
        }
    }

    async deleteUnitById(unitId, view, controlAccess) {
        assert(unitId !== undefined);
        assert(view !== undefined);
        try {
            let unit = await this.#unitModel.getUnitById(unitId);
            if (unit === null)
                throw new ComaintApiErrorUnauthorized('error.not_found');
            if (! controlAccess(unit))
                throw new ComaintApiErrorUnauthorized('error.not_owner');
            const deleted = await this.#unitModel.deleteUnitById(unitId);
            view.json({deleted});
        }
        catch(error) {
            view.error(error);
        }
    }
}

export default UnitController;
