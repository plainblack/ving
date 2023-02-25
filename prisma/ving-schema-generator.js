"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var generator_helper_1 = require("@prisma/generator-helper");
var path = require("path");
var fs = require("fs");
var GENERATOR_NAME = 'ving-schema-generator';
var sync_1 = require("csv-parse/sync");
var version = require('../package.json').version;
(0, generator_helper_1.generatorHandler)({
    onManifest: function () {
        return {
            version: version,
            defaultOutput: '../generated',
            prettyName: GENERATOR_NAME
        };
    },
    onGenerate: function (options) { return __awaiter(void 0, void 0, void 0, function () {
        var outputFolder, config, datamodel, enums, _i, _a, value, options_1, directives, labels, i, _b, _c, enumValue, _d, _e, table, tableDirectives, _f, _g, field, fieldDirectives, _h, _j, prop, values;
        var _k, _l;
        var _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    outputFolder = ((_m = options.generator.output) === null || _m === void 0 ? void 0 : _m.value) || '.';
                    config = options.generator.config;
                    datamodel = options.dmmf.datamodel;
                    enums = {};
                    for (_i = 0, _a = datamodel.enums; _i < _a.length; _i++) {
                        value = _a[_i];
                        options_1 = [];
                        directives = parseDirectives(value.documentation);
                        labels = directives.labels || [];
                        i = 0;
                        for (_b = 0, _c = value.values; _b < _c.length; _b++) {
                            enumValue = _c[_b];
                            options_1.push({
                                value: enumValue.name,
                                label: typeof labels[i] != 'undefined' ? labels[i] : enumValue.name
                            });
                            i++;
                        }
                        enums[value.name] = options_1;
                    }
                    for (_d = 0, _e = datamodel.models; _d < _e.length; _d++) {
                        table = _e[_d];
                        tableDirectives = parseDirectives(table.documentation);
                        table.ving = { owner: ['admin'] };
                        if (tableDirectives.owner) {
                            (_k = table.ving.owner).push.apply(_k, tableDirectives.owner);
                        }
                        for (_f = 0, _g = table.fields; _f < _g.length; _f++) {
                            field = _g[_f];
                            field.ving = { options: [], editBy: [], viewBy: [] };
                            // add enums as options
                            if (field.kind == 'enum') {
                                field.ving.options = enums[field.type];
                            }
                            fieldDirectives = parseDirectives(field.documentation);
                            for (_h = 0, _j = ['editBy', 'viewBy', 'labels']; _h < _j.length; _h++) {
                                prop = _j[_h];
                                values = fieldDirectives[prop];
                                if (prop == 'labels') {
                                    if (field.type == 'Boolean') {
                                        field.ving.options = [{
                                                value: true,
                                                label: (values !== undefined && values[0] !== undefined) ? values[0] : 'True'
                                            }, {
                                                value: false,
                                                label: (values !== undefined && values[1] !== undefined) ? values[1] : 'False'
                                            }];
                                    }
                                }
                                else if (typeof values != 'undefined') {
                                    (_l = field.ving[prop]).push.apply(_l, values);
                                }
                            }
                        }
                    }
                    return [4 /*yield*/, writeFileSafely(outputFolder + '/ving-schema.json', JSON.stringify(datamodel.models, undefined, 2))];
                case 1:
                    _o.sent();
                    return [2 /*return*/];
            }
        });
    }); }
});
function parseDirectives(string) {
    if (!string) {
        return {};
    }
    var rows = string.split(/\n/);
    var out = {};
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var row = rows_1[_i];
        var found = row.match(/^@ving\.(\w+)\s*:\s*(.*)$/);
        if (found != null) {
            var key = found[1];
            var labels = (0, sync_1.parse)(found[2], { ltrim: true, rtrim: true })[0];
            out[key] = labels;
        }
    }
    return out;
}
var writeFileSafely = function (writeLocation, content) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs.mkdirSync(path.dirname(writeLocation), {
            recursive: true
        });
        fs.writeFileSync(writeLocation, content);
        return [2 /*return*/];
    });
}); };
