"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var db_1 = require("@/db");
var homepageSchema_1 = require("@/db/homepageSchema");
var cache_1 = require("next/cache");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, admin, rows, normalized, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, db_1.connectDB)()];
                case 1:
                    _a.sent();
                    searchParams = request.nextUrl.searchParams;
                    admin = searchParams.get('admin');
                    rows = void 0;
                    if (!(admin === '1' || admin === 'true')) return [3 /*break*/, 3];
                    return [4 /*yield*/, homepageSchema_1.HomepageHeroFeatures.find().sort({ display_order: 1 }).lean()];
                case 2:
                    rows = _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, homepageSchema_1.HomepageHeroFeatures.find({ is_active: 1 }).sort({ display_order: 1 }).lean()];
                case 4:
                    rows = _a.sent();
                    _a.label = 5;
                case 5:
                    normalized = Array.isArray(rows) ? rows.map(function (r) { return (__assign(__assign({}, r), { id: r._id ? String(r._id) : undefined })); }) : [];
                    return [2 /*return*/, server_1.NextResponse.json(normalized)];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error fetching homepage hero features:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch homepage hero features' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, _a, icon, title, _b, description, _c, display_order, _d, is_active, res, error_2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, db_1.connectDB)()];
                case 1:
                    _e.sent();
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _e.sent();
                    _a = body.icon, icon = _a === void 0 ? '' : _a, title = body.title, _b = body.description, description = _b === void 0 ? '' : _b, _c = body.display_order, display_order = _c === void 0 ? 0 : _c, _d = body.is_active, is_active = _d === void 0 ? 1 : _d;
                    if (!title)
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Title is required' }, { status: 400 })];
                    return [4 /*yield*/, homepageSchema_1.HomepageHeroFeatures.create({ icon: icon, title: title, description: description, display_order: display_order, is_active: is_active })];
                case 3:
                    res = _e.sent();
                    (0, cache_1.revalidateTag)('homepage-hero-floats', 'max');
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, id: res._id }, { status: 201 })];
                case 4:
                    error_2 = _e.sent();
                    console.error('Error creating homepage hero feature:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to create homepage hero feature' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body_1, id, update_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, db_1.connectDB)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, request.json()];
                case 2:
                    body_1 = _a.sent();
                    id = body_1.id;
                    if (!id)
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'ID is required' }, { status: 400 })];
                    update_1 = {};
                    ['icon', 'title', 'description', 'display_order', 'is_active'].forEach(function (k) { if (body_1[k] !== undefined)
                        update_1[k] = body_1[k]; });
                    return [4 /*yield*/, homepageSchema_1.HomepageHeroFeatures.findByIdAndUpdate(id, update_1, { new: true })];
                case 3:
                    _a.sent();
                    (0, cache_1.revalidateTag)('homepage-hero-floats', 'max');
                    return [2 /*return*/, server_1.NextResponse.json({ success: true })];
                case 4:
                    error_3 = _a.sent();
                    console.error('Error updating homepage hero feature:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update homepage hero feature' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, db_1.connectDB)()];
                case 1:
                    _a.sent();
                    searchParams = request.nextUrl.searchParams;
                    id = searchParams.get('id');
                    if (!id)
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'ID is required' }, { status: 400 })];
                    return [4 /*yield*/, homepageSchema_1.HomepageHeroFeatures.findByIdAndDelete(id)];
                case 2:
                    _a.sent();
                    (0, cache_1.revalidateTag)('homepage-hero-floats', 'max');
                    return [2 /*return*/, server_1.NextResponse.json({ success: true })];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error deleting homepage hero feature:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to delete homepage hero feature' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
