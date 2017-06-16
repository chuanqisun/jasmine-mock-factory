declare var __karma__: any;
declare var require: any;

__karma__.loaded = function () { };

const context = require.context('./', true, /\.spec\.ts$/);
context.keys().map(context);

__karma__.start();
