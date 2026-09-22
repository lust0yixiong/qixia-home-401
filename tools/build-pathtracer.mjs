import {build} from 'esbuild';
// Only the exact "three" import is external: bundling addons avoids bare subpath
// imports, and the app and tracer share the existing Three r160 instance.
await build({entryPoints:['tools/pathtracer-entry.js'],bundle:true,format:'esm',minify:true,outfile:'assets/pathtracer-v0.0.20.js',plugins:[{name:'shared-three',setup(build){build.onResolve({filter:/^three$/},()=>({path:'three',external:true}));}}]});
