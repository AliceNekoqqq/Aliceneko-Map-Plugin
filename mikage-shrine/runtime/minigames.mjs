// Built as a self-contained remote module. The character card only stores its loader.
export const version = '1.13.0';
export const scriptId = 'minigames';
export const VERSION = version;
export const SCRIPT_ID = scriptId;

const GAME_CSS = "/* Scoped paper theatre. Every action remains a native keyboard-operable button. */\n.mka{--ink:#3c5048;--muted:#768176;--moss:#6d866a;--rose:#bf788a;--paper:#fffaf0;--line:#d9dfce;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:20px;padding:clamp(14px,4vw,25px);font:15px/1.65 \"Mikage Serif\",-apple-system,BlinkMacSystemFont,\"Noto Sans SC\",sans-serif;box-shadow:0 14px 40px #3346320c;isolation:isolate;width:100%;max-width:740px;margin:auto;text-align:left}\n.mka,.mka *{box-sizing:border-box}.mka [hidden]{display:none!important}.mka button{font:inherit;-webkit-tap-highlight-color:transparent}.mka-heading{display:flex;align-items:center;gap:13px;margin-bottom:12px}.mka-emblem{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:50%;background:#e9eedf;color:var(--moss)}.mka-emblem .mka-icon{width:27px;height:27px}.mka-kicker{font-size:10px;letter-spacing:.2em;color:var(--muted)}.mka h3.mka-title{font-size:21px;letter-spacing:.05em;font-weight:600;line-height:1.4;margin:2px 0}.mka-help{font-size:13px;color:#657166;margin:0 0 15px}.mka-icon{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;pointer-events:none}\n.mka-stage{position:relative;min-height:254px;overflow:hidden;border:1px solid #dfe3d5;border-radius:15px;background:radial-gradient(ellipse at 15% 10%,#fffdf5 0,transparent 60%),#f1f0e5;margin-bottom:10px;padding:45px 15px 15px}.mka-scene-caption{position:absolute;top:13px;left:16px;right:16px;font-size:12px;color:#6d796b;z-index:2;line-height:1.5;pointer-events:none}.mka-scenery{position:absolute;inset:0;pointer-events:none;z-index:-1}.mka-stage .mka-scenery{z-index:0}.mka-stage>:not(.mka-scenery){position:relative}.mka-stage>.mka-scene-caption{position:absolute}.mka-progress{min-height:44px;margin:10px 1px;color:#63765e;font-size:13px;display:flex;align-items:center;line-height:1.7}.mka-controls{display:flex;flex-wrap:wrap;gap:8px}.mka-button{position:relative;min-height:46px;min-width:46px;max-width:100%;padding:9px 15px;border:1px solid #c7d1bc;border-radius:11px;background:#e8eddf;color:#3d5943;cursor:pointer;line-height:1.5;transition:background .18s,transform .18s,border-color .18s;touch-action:manipulation;white-space:normal}.mka-button:hover:not(:disabled){background:#dbe5cf;border-color:#8da383;transform:translateY(-1px)}.mka-button:active:not(:disabled){transform:translateY(1px)}.mka-button:focus-visible{outline:3px solid #b47d8e;outline-offset:3px;z-index:5}.mka-button:disabled{cursor:default;opacity:.42}.mka-button.mka-selected{background:#6f886b;color:#fff;border-color:#6f886b}.mka-quiet{background:transparent;color:#737c6d;border-color:#d8ddcf;font-size:12px}.mka-footer{display:flex;justify-content:space-between;gap:10px;border-top:1px solid #e3e6da;margin-top:18px;padding-top:12px}.mka-result{border:1px solid #cbd9c1;border-radius:12px;background:#eff3e7;text-align:center;padding:17px;margin-top:15px;color:#4e694c;font-size:14px}.mka-result>.mka-icon{width:30px;height:30px;margin-bottom:4px}.mka-result p{font-size:12px;margin:5px 0 0;color:#74816d}\n/* Courtyard: tactile leaves move into a real, growing basket. */\n.mka-scenery-courtyard{background:linear-gradient(0deg,#c6d0b3 0,transparent 22%),repeating-linear-gradient(90deg,transparent 0 47px,#bac6b722 48px 49px),linear-gradient(145deg,#e3e5d8,#f3eee0)}.mka-stage .mka-leaves{position:relative;height:170px;margin-right:75px;overflow:visible}.mka-leaf.mka-button{position:absolute!important;width:48px;height:48px;border:0;background:transparent;transform:rotate(var(--turn));padding:7px;color:#b78a4b}.mka-leaf .mka-icon{width:34px;height:34px;fill:#dfc78366}.mka-leaf:nth-child(even){color:#ba7f6c}.mka-leaf.mka-button:hover{background:#fff8;transform:rotate(var(--turn)) scale(1.14)}.mka-stage .mka-basket{position:absolute;right:14px;bottom:19px;width:95px;min-height:87px;text-align:center;padding:8px;border-radius:8px 8px 30px 30px;border:2px solid #b99b6b;background:repeating-linear-gradient(0deg,#cfb990 0 3px,#c4ac7d 4px 5px);color:#654d32;font-size:11px;box-shadow:0 7px 12px #57482d15}.mka-gathered{display:flex;flex-wrap:wrap;justify-content:center;gap:0}.mka-gathered .mka-icon{width:23px;height:23px;color:#926c3d;transform:rotate(var(--turn));fill:#e9d69b}\n/* A distant cat and three beads of patience. */\n.mka-scenery-garden{background:radial-gradient(ellipse at 88% 75%,#9fac8b88 0 17%,transparent 18%),radial-gradient(ellipse at 8% 80%,#aebc9888 0 17%,transparent 18%),linear-gradient(#e6eadc,#f4eadb)}.mka-cat{width:130px;margin:30px 15% 0 auto;text-align:center;color:#9a8675;transform:scale(.8);transform-origin:bottom center;transition:transform .6s,margin .6s}.mka-cat>.mka-icon{width:110px;height:110px;fill:#c1b09c22;stroke-width:.8}.mka-cat span{display:block;font-size:11px;color:#8b8b74}.mka-cat-near{margin-left:auto;margin-right:auto;transform:scale(1)}.mka-patience{display:flex;justify-content:center;gap:9px;margin-top:14px}.mka-dot{width:8px;height:8px;border:1px solid #bfc7ae;border-radius:50%;background:#f5f0df}.mka-dot.mka-lit{background:#8ca279;border-color:#8ca279}.mka-nuzzle{animation:mka-nuzzle .65s ease-in-out}@keyframes mka-nuzzle{50%{transform:rotate(-8deg) scale(1.04)}}\n/* Delicate dango and folded coloured paper. */\n.mka-dango-stick{display:flex;align-items:center;justify-content:center;gap:4px;margin:49px auto 30px;max-width:280px;position:relative;padding:0 23px;min-height:75px}.mka-dango-stick:before{content:\"\";height:5px;background:#bfa67c;position:absolute;left:0;right:0;top:50%;border-radius:4px}.mka-dango-ball{display:grid;place-items:center;width:64px;height:64px;flex-shrink:0;border-radius:50%;border:1px solid #bcbba47a;background:#e7e8d7;position:relative;color:#6b705c;font-size:11px;box-shadow:inset -5px -7px 12px #786b3b12,inset 5px 7px 8px #ffffff7d}.mka-swatch:before{content:\"\";display:inline-block;width:13px;height:13px;border-radius:50%;background:var(--swatch);border:1px solid #9a9d8866;margin-right:8px;vertical-align:-1px}.mka-paper{width:130px;height:130px;margin:25px auto 20px;box-shadow:3px 7px 12px #66543a18;border:1px solid #ffffffaa;transform:rotate(-8deg);display:grid;place-items:center}.mka-paper>.mka-icon{width:75px;height:75px;color:#6a7e7199}.mka-fold-1{background-image:linear-gradient(135deg,transparent 49%,#fff9 50%,transparent 51%)!important}.mka-fold-2{clip-path:polygon(50% 5%,100% 90%,0 90%);transform:none}.mka-fold-3{clip-path:polygon(0 40%,50% 0,100% 40%,80% 95%,20% 95%);transform:none}\n.mka-scenery-stream{background:repeating-linear-gradient(-6deg,transparent 0 26px,#ffffff5c 27px 29px,transparent 30px 50px),linear-gradient(90deg,#c3cdb0 0 10%,#b5d2cf 17% 83%,#c3cdb0 90%)}.mka-stage .mka-boat{position:relative;z-index:2;width:75px;margin:66px auto 15px;transition:transform .5s}.mka-boat>.mka-icon{width:75px;height:75px;stroke:#5d7c79;fill:currentColor}.mka-boat-left{transform:translateX(-65px) rotate(-10deg)}.mka-boat-right{transform:translateX(65px) rotate(10deg)}.mka-stones{position:absolute!important;inset:90px 20px auto;display:flex;justify-content:space-between;pointer-events:none}.mka-stones span{width:48px;height:30px;border-radius:60% 40% 35% 55%;background:#8b9a9366;border-bottom:4px solid #64766f66}.mka-stones-0 span:first-child,.mka-stones-1 span:last-child{visibility:hidden}\n/* Stationery: tickets and coastal tram-stop postcards, never beach furniture. */\n.mka-scenery-platform{background:linear-gradient(0deg,#798b7c22 0 18%,transparent 19%),repeating-linear-gradient(90deg,transparent 0 60px,#b3bda640 61px 62px),linear-gradient(#dde6db,#f2eddd)}.mka-scenery-coast-platform{background:linear-gradient(0deg,#b7b9ac 0 5%,#d6d6c6 6% 15%,#697f7933 16% 17%,transparent 18%),linear-gradient(#e2ece9 0 48%,#a5c9c6 49% 72%,#d5e1d4 73%)}.mka-ticket{background:#fff8e8;margin:28px auto 10px;max-width:300px;padding:17px 22px;border:1px dashed #b6bb9a;border-radius:4px;box-shadow:2px 5px 10px #4d563315;transform:rotate(-3deg);position:relative}.mka-ticket:after{content:\"\";position:absolute;right:17px;top:0;bottom:0;border-left:1px dashed #c9cbb2}.mka-ticket-label{display:block;font-size:9px;letter-spacing:.12em;color:#8a9376}.mka-ticket strong{font-size:17px;font-weight:500}.mka-ticket-stamps{display:flex;gap:11px;margin-top:14px}.mka-stamp-slot{display:grid;place-items:center;width:49px;height:49px;border:1px solid #d5c3b3;border-radius:50%;color:#bd8590;background:#fffaf0}.mka-stamp-slot .mka-icon{width:28px;height:28px;transform:rotate(-12deg)}.mka-postcard{max-width:350px;margin:21px auto 5px;padding:17px;background:#fffbec;box-shadow:2px 5px 14px #37493822;transform:rotate(2deg);border:1px solid #fdfdf4}.mka-collage{display:flex;gap:8px;margin-top:14px}.mka-collage-slot{min-width:0;flex:1;min-height:85px;border:1px dashed #a9b9a0;background:#dfeae266;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#678e83;font-size:10px}.mka-collage-slot:nth-child(2){background:#f2e7d366;color:#b19a6c;transform:rotate(-5deg)}.mka-collage-slot:nth-child(3){background:#e9d9da66;color:#a97783;transform:rotate(4deg)}.mka-collage-slot .mka-icon{width:37px;height:37px;margin-bottom:5px}.mka-card-note{font-size:11px;margin:13px 0 0;color:#7d8879}\n/* Botanical impressions. */\n.mka-scenery-grove{background:radial-gradient(ellipse at 5% 95%,#9aaf7b66 0 25%,transparent 26%),radial-gradient(ellipse at 90% 90%,#afc39988 0 25%,transparent 26%),linear-gradient(#e5ead8,#e9e7ce)}.mka-grove{display:flex;align-items:center;justify-content:space-evenly;gap:10px;min-height:178px}.mka-found-leaf.mka-button{width:27%;background:#fff8;border:1px solid #d7dec5;min-height:115px;padding:12px 3px;display:flex;flex-direction:column;align-items:center;color:#829c68;font-size:11px}.mka-found-leaf .mka-icon{width:47px;height:58px;margin-bottom:5px;stroke-width:1}.mka-found-leaf.mka-found{background:#dfe8ce;opacity:.72}.mka-ginkgo>.mka-icon{transform:rotate(-22deg) scaleX(1.25);color:#a99b4f}.mka-fern>.mka-icon{color:#7a9669}.mka-camellia>.mka-icon{transform:rotate(20deg) scaleX(.7);color:#587e66}.mka-rubbing{background:#fffae9;min-height:154px;margin:22px auto 10px;max-width:330px;border:1px solid #eee6cb;box-shadow:0 5px 10px #5a563014;display:flex;align-items:center;justify-content:space-evenly;transform:rotate(-2deg);color:#9ca58a}.mka-rubbing>div{display:flex;flex-direction:column;align-items:center;font-size:10px}.mka-rubbing .mka-icon{width:53px;height:84px;stroke-width:.7;color:inherit}.mka-rubbing.moss{color:#6d8b61}.mka-rubbing.rose{color:#bb7c89}.mka-rubbing.ochre{color:#b49b58}\n/* Night scenes, understated gold-green lights. */\n.mka-scenery-night,.mka-scenery-night-path{background:radial-gradient(circle at 82% 15%,#e9e6b266 0 5%,transparent 6%),linear-gradient(#40594f,#7c8b70)}.mka-stage-R08 .mka-scene-caption,.mka-stage-R10 .mka-scene-caption{color:#edf0df}.mka-fireflies{display:flex;align-items:center;justify-content:space-evenly;gap:12px;min-height:170px}.mka-firefly.mka-button{width:62px;height:82px;border:1px solid #e2e7bc33;background:#14281f22;color:#b5c2a0;padding:12px 5px}.mka-firefly .mka-icon{width:30px;height:38px;margin:auto;display:block}.mka-firefly span{font-size:11px}.mka-firefly.mka-awake{color:#d8e3af;border-color:#d9e3ad77}.mka-firefly.mka-glow{color:#fff9c7;background:#d8e4a533;box-shadow:0 0 30px 9px #e9f3ac44;transform:translateY(-8px)}.mka-firefly.mka-button:disabled{opacity:1}.mka-firefly:nth-child(2){margin-top:40px}.mka-scenery-night-path{background:linear-gradient(160deg,transparent 0 55%,#c3c4a733 56% 65%,transparent 66%),linear-gradient(#3b514b,#78886f)}.mka-lanterns{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:300px;margin:12px auto 3px}.mka-lantern.mka-button{width:100%;height:81px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:0;color:#c7cfb888;border-color:#cfdbb72b;background:#ffffff08}.mka-lantern .mka-icon{width:33px;height:43px;stroke-width:1}.mka-lantern span{font-size:9px}.mka-lantern.mka-lantern-lit{border-color:#e2d9b388;box-shadow:0 0 15px #ffe8b222;color:#eddca4;background:#e0c98d22}.mka-lantern.mka-sakura{color:#f0bfcb;background:#d69aaf22;box-shadow:0 0 15px #f0bfcb22}.mka-lantern.mka-jade{color:#c2ded0;background:#9ec6b822;box-shadow:0 0 15px #c2ded022}\n/* Drum practice. */\n.mka-drum{margin:11px auto 2px;width:95px;color:#ae7e70}.mka-drum>.mka-icon{width:95px;height:95px;fill:#dbaf8b22;stroke-width:.9}.mka-beats{display:flex;gap:11px;justify-content:center;margin:3px auto 12px}.mka-beat{display:grid;place-items:center;width:43px;height:43px;border:1px solid #d6cbb6;border-radius:50%;color:#b9b099;background:#fff8e9;font-size:15px}.mka-beat-next{border:2px solid #a5b294;color:#5e775b}.mka-beat-done{background:#dbe5cd;color:#55724f}.mka-drum-button{flex:1;min-width:100px;background:#efe2d7;border-color:#d1b8a7;color:#825e51}.mka-hit{animation:mka-hit .2s ease-out}@keyframes mka-hit{45%{transform:scale(.92) rotate(-3deg)}}\n.mka-reduced *{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.mka *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(max-width:390px){.mka{padding:13px;border-radius:15px;font-size:14px}.mka h3.mka-title{font-size:18px}.mka-button{padding:9px 11px}.mka-controls>.mka-button{flex-grow:1}.mka-stage{min-height:247px}.mka-cat{margin-right:6%}.mka-dango-ball{width:56px;height:56px}.mka-scene-caption{font-size:11px}.mka-collage{gap:6px}.mka-postcard{padding:12px}.mka-found-leaf .mka-icon{width:39px}.mka-fireflies{gap:8px}} \n\n.mka-footer .mka-button{display:flex;align-items:center;justify-content:center;gap:6px}.mka-footer .mka-icon{width:16px;height:16px}\n\n/* 1.11 · illustrated pocket stages, designed for narrow touch screens. */\n.mka{--ink:#403c34;--moss:#59745d;--rose:#a96570;position:relative;border-color:#d4c5a6;border-radius:17px;background:linear-gradient(145deg,#fffaf0,#f6efdf);box-shadow:0 12px 34px #382b1d18,inset 0 1px #fff}.mka:before{content:\"\";position:absolute;inset:6px;border:1px solid #cbb99155;border-radius:12px;pointer-events:none}\n.mka-emblem{background:radial-gradient(circle at 35% 25%,#faf3de,#dfe5d1);box-shadow:inset 0 0 0 1px #fff8,0 2px 6px #34452a12}.mka-kicker{letter-spacing:.22em;color:#9b8362}.mka h3.mka-title{color:#4e5542;letter-spacing:.09em}.mka-help{color:#7a7868;line-height:1.75}\n.mka-stage{min-height:300px;height:clamp(280px,52vw,390px);padding:52px 16px 17px;border:1px solid #c8b995;border-radius:13px;background:#ddd7c6;box-shadow:inset 0 0 0 3px #fff6,0 6px 15px #342b1b1c;isolation:isolate}.mka-stage .mka-scenery{z-index:0;overflow:hidden;border-radius:inherit}.mka-stage>:not(.mka-scenery){position:relative;z-index:1}.mka-stage>.mka-scene-caption{z-index:3;top:10px;left:10px;right:10px;width:max-content;max-width:calc(100% - 20px);padding:6px 11px;border:1px solid #fff9;border-radius:999px;background:#fff7e9d9;box-shadow:0 2px 8px #2b312225;color:#595b49;font-size:11px;line-height:1.45;backdrop-filter:blur(4px)}.mka-scene-art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 56%;filter:saturate(.92) contrast(.98)}.mka-scenery:after{content:\"\";position:absolute;inset:0;background:linear-gradient(180deg,#20241615 0%,transparent 37%,#17201a12 100%),linear-gradient(90deg,#fff2,transparent 16% 84%,#1d29141a);pointer-events:none}.mka[data-period=night] .mka-scene-art{filter:saturate(.78) brightness(.78)}.mka[data-period=dusk] .mka-scene-art{filter:saturate(.95) sepia(.08)}\n.mka-progress{min-height:48px;padding:4px 12px;border-left:2px solid #b49467;border-radius:0 8px 8px 0;background:linear-gradient(90deg,#e9e5d6,#f7f2e5 75%);color:#616b55;line-height:1.7}.mka-controls{gap:8px}.mka-controls>.mka-button{flex:1 1 auto;min-width:min(126px,calc(50% - 5px));border-color:#c9b997;border-radius:9px;background:linear-gradient(#fffaf0,#efe6d3);box-shadow:0 2px 0 #d6c7a9;color:#5c5848}.mka-controls>.mka-button:hover:not(:disabled){background:#f7edda;border-color:#ad9267;box-shadow:0 3px 0 #d6c7a9}.mka-controls>.mka-button.mka-selected{background:linear-gradient(#728b70,#596f58);border-color:#596f58;box-shadow:0 2px 0 #465a46;color:#fff9e9}.mka-controls>.mka-button.mka-quiet{background:transparent;box-shadow:none;color:#817b69}.mka-result{border-color:#c9b282;background:linear-gradient(145deg,#f8f0d9,#ede4cb);color:#5a684e;box-shadow:inset 0 0 0 3px #fff8}.mka-result>.mka-icon{color:#9e7943;filter:drop-shadow(0 1px #fff)}\n.mka-stage .mka-leaves{height:190px;margin-right:70px}.mka-leaf.mka-button{min-width:48px;min-height:48px;background:#fff2;border-radius:50%;filter:drop-shadow(0 3px 2px #30281820)}.mka-leaf.mka-button:hover:not(:disabled){background:#fff9;filter:drop-shadow(0 4px 4px #30281845)}.mka-basket{z-index:2}.mka-gathered .mka-icon{animation:mka-leaf-land .36s ease-out both}@keyframes mka-leaf-land{from{opacity:0;transform:translateY(-13px) rotate(var(--turn)) scale(.6)}to{opacity:1;transform:rotate(var(--turn)) scale(1)}}\n.mka-cat{width:150px;margin:38px 12% 0 auto;padding:5px 7px;border-radius:70px 70px 20px 20px;background:#fff6;filter:drop-shadow(0 5px 4px #352a1f38);transition:transform .55s,margin .55s}.mka-cat-art{display:block;width:100%;height:128px;object-fit:contain;filter:drop-shadow(0 3px 2px #3b2d1e40)}.mka-cat span{padding:3px 7px;background:#fff9;border-radius:99px;color:#6f6b55}.mka-cat-near{margin-right:auto;transform:scale(1.08)}.mka-cat-curious .mka-cat-art{animation:mka-cat-curious .75s ease-in-out 2}@keyframes mka-cat-curious{40%{transform:translateY(-4px) rotate(2deg)}70%{transform:translateY(1px) rotate(-2deg)}}\n.mka-sauce{width:max-content;max-width:100%;margin:8px auto 0;padding:6px 14px;border:1px solid #fff9;border-radius:99px;background:#fff9;color:#6f6049;font-size:11px;box-shadow:0 2px 7px #342b1b18}.mka-sauce-honey{background:#f2d9a3d9}.mka-sauce-berry{background:#edc6cbd9}.mka-sauce-tea{background:#d7e2c2e8}\n.mka-paper{border-radius:3px;box-shadow:3px 8px 13px #3028182b,inset 0 0 0 1px #ffffffaa}.mka-paper.mka-fold-flat{clip-path:polygon(4% 25%,96% 25%,91% 83%,9% 83%);transform:none}.mka-paper.mka-fold-swift{clip-path:polygon(50% 0,97% 83%,50% 100%,3% 83%);transform:none}.mka-paper.mka-fold-charm:after{content:\"✦\";position:absolute;right:13px;top:12px;color:#fff8;font-size:21px}.mka-scenery-stream .mka-scene-art{object-position:center 54%}.mka-stage .mka-boat{filter:drop-shadow(0 5px 2px #28413b55)}.mka-boat>.mka-icon{fill:#fff9;stroke:#536f69;stroke-width:1.2}.mka-boat-left{transform:translateX(-60px) rotate(-10deg)}.mka-boat-right{transform:translateX(60px) rotate(10deg)}.mka-stones span{box-shadow:inset 4px 4px 6px #fff3,0 3px 3px #25372c30}\n.mka-river-canvas{display:block;width:min(100%,600px);height:clamp(158px,52vw,250px);max-height:250px;margin:0 auto;border:1px solid #f8fff0a8;border-radius:11px;background:#dcebe0b8;box-shadow:inset 0 0 0 3px #ffffff30,0 4px 12px #314c3b18;touch-action:none;cursor:grab;outline:none}.mka-river-canvas:active{cursor:grabbing}.mka-river-canvas:focus-visible{outline:3px solid #a96570;outline-offset:3px}\n.mka-ticket,.mka-postcard{border-radius:5px;border-color:#d3c39e;background:linear-gradient(145deg,#fffaf0,#f6edda);box-shadow:0 8px 17px #352d1e36,inset 0 0 0 3px #fff9}.mka-ticket{padding:15px 20px}.mka-ticket-stop{display:block;margin-top:4px;color:#9a8565;font-size:10px}.mka-postcard{max-width:320px;padding:12px 14px;transform:rotate(1.2deg)}.mka-photo-view{height:100px;margin:8px 0 7px;display:flex;align-items:center;justify-content:center;gap:9px;border:1px solid #fff9;background:linear-gradient(180deg,#d9e8e6 0 48%,#84aaa5 49% 69%,#e5d6b8 70%);color:#667c6d;overflow:hidden;position:relative}.mka-photo-view:after{content:\"\";position:absolute;inset:auto 0 0;height:22px;background:linear-gradient(#e8dfcc,#c3ab83)}.mka-photo-view .mka-icon{width:41px;height:53px;filter:drop-shadow(0 3px 2px #35423934);z-index:1}.mka-photo-view span{font-size:11px;z-index:1}.mka-frame-blue{border-color:#70979c;box-shadow:0 0 0 4px #9cbec1,inset 0 0 0 8px #e4eeee}.mka-frame-bell{border-color:#b7867f;box-shadow:0 0 0 4px #ead5ca,inset 0 0 0 8px #fff4e9}\n.mka-lanterns.mka-layout-row{grid-template-columns:repeat(6,minmax(0,1fr));gap:5px}.mka-lanterns.mka-layout-arc .mka-lantern:nth-child(odd){transform:translateY(-8px)}.mka-lanterns.mka-layout-path .mka-lantern:nth-child(3n+2){transform:translateY(6px)}.mka-lantern.mka-button{box-shadow:inset 0 0 0 2px #fff1,0 3px 9px #121e2625;border-radius:10px}.mka-lantern.mka-lantern-lit{animation:mka-lantern-in .34s ease-out both}@keyframes mka-lantern-in{0%{filter:brightness(.8);transform:scale(.88)}65%{filter:brightness(1.35);transform:scale(1.06)}100%{filter:brightness(1);transform:scale(1)}}\n@media(max-width:520px){.mka-stage{height:clamp(280px,80vw,360px);padding:48px 10px 12px}.mka-controls>.mka-button{min-width:calc(50% - 5px);padding:9px 9px;font-size:13px}.mka-stage .mka-leaves{margin-right:57px}.mka-basket{right:7px!important;width:82px!important}.mka-cat{width:135px;margin-right:7%}.mka-cat-art{height:116px}.mka-lanterns.mka-layout-row{grid-template-columns:repeat(3,minmax(0,1fr))}.mka-postcard{max-width:min(320px,96%);padding:10px}.mka-photo-view{height:88px}.mka-collage-slot{min-height:51px}}\n@media(prefers-reduced-motion:reduce){.mka-gathered .mka-icon,.mka-cat-curious .mka-cat-art,.mka-lantern.mka-lantern-lit{animation:none!important}}\n.mka-stage[data-wind=soft] .mka-leaf{animation:mka-leaf-drift-soft 3.8s ease-in-out infinite alternate}.mka-stage[data-wind=cross] .mka-leaf{animation:mka-leaf-drift-cross 2.8s ease-in-out infinite alternate}.mka-stage[data-wind=west] .mka-leaf{animation:mka-leaf-drift-west 3.1s ease-in-out infinite alternate}\n@keyframes mka-leaf-drift-soft{to{margin-left:4px;filter:drop-shadow(0 5px 5px #3028183b)}}@keyframes mka-leaf-drift-cross{to{margin-left:10px;transform:rotate(calc(var(--turn) + 16deg)) translateX(5px)}}@keyframes mka-leaf-drift-west{to{margin-left:-8px;transform:rotate(calc(var(--turn) - 14deg)) translateX(-5px)}}\n.mka-photo-view{background-size:cover!important;background-position:center 58%;text-shadow:0 1px 5px #1c2733a8}.mka-photo-view.mka-view-lighthouse{background-position:58% 53%}.mka-photo-view.mka-view-tram{background-position:19% 70%}.mka-photo-view.mka-view-firefly{background-position:82% 54%}\n@media(prefers-reduced-motion:reduce){.mka-stage[data-wind] .mka-leaf{animation:none!important}}\n.mka-stage.mka-stage-R06{height:clamp(340px,52vw,400px)}\n@media(max-width:520px){.mka-stage.mka-stage-R06{height:clamp(350px,96vw,400px)}}\n\n/* R03 · tactile dango counter, fire-control puzzle and finished recipe card. */\n.mka-stage.mka-stage-R03{height:clamp(340px,76vw,430px);padding:54px 14px 14px;background:#74533b}\n.mka-stage-R03 .mka-scene-art{object-position:center 62%;filter:saturate(1.02) contrast(1.02)}\n.mka-stage-R03 .mka-scenery:after{background:linear-gradient(180deg,#2c20153b,transparent 34%,#30201508 68%,#27190c22)}\n.mka-stage-R03 .mka-dango-steps{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:clamp(4px,2vw,11px);width:max-content;max-width:100%;margin:1px auto 0;padding:7px 10px;border:1px solid #fff9;border-radius:999px;background:#fff5e9e8;box-shadow:0 4px 14px #21150930;backdrop-filter:blur(8px)}\n.mka-stage-R03 .mka-dango-step{display:inline-flex;align-items:center;gap:4px;color:#8e8069;font-size:10px;white-space:nowrap}\n.mka-stage-R03 .mka-dango-step i{display:grid;place-items:center;width:19px;height:19px;border:1px solid #cbb99a;border-radius:50%;background:#fffaf0;color:#8d7653;font:normal 10px/1 sans-serif}\n.mka-stage-R03 .mka-dango-step.is-current{color:#653e35;font-weight:700}.mka-stage-R03 .mka-dango-step.is-current i{border-color:#a95756;background:#a95756;color:#fff8e9}.mka-stage-R03 .mka-dango-step.is-done i{border-color:#71886d;background:#71886d;color:#fff}\n.mka-stage-R03 .mka-dango-stick{position:absolute;z-index:2;left:50%;bottom:14%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;gap:clamp(4px,1.2vw,12px);width:min(90%,410px);min-height:82px;margin:0;padding:7px 19px;filter:drop-shadow(0 7px 5px #38241855);transition:filter .25s}\n.mka-stage-R03 .mka-dango-stick:before{left:5%;right:5%;top:50%;height:5px;border:1px solid #e9cb91;background:linear-gradient(#c69757,#815b35);box-shadow:0 2px 4px #34211055}\n.mka-stage-R03 .mka-dango-ball{display:grid;place-items:center;position:relative;z-index:1;width:clamp(46px,14vw,70px);height:clamp(46px,14vw,70px);border:1px solid #fff9;border-radius:50%;background:radial-gradient(circle at 32% 26%,#fff9 0 7%,transparent 25%),radial-gradient(circle at 38% 30%,var(--ball-color,#eee4ca) 0 49%,color-mix(in srgb,var(--ball-color,#eee4ca),#63402d 28%) 100%);box-shadow:inset -5px -7px 10px #5b351a1c,inset 5px 5px 8px #fff8,0 3px 7px #3c241b3d;color:#786149;font:11px/1 sans-serif;transition:transform .25s,filter .25s}\n.mka-stage-R03 .mka-dango-ball[aria-label$=\"待选\"]{background:radial-gradient(circle at 35% 30%,#fff9,#e7dac188 58%,#9e79544a);color:#8d7559;font-size:18px}\n.mka-stage-R03 .mka-dango-ball.is-roasted:after{content:\"\";position:absolute;inset:8px;border:2px dotted #9b603b77;border-radius:50%;transform:rotate(-18deg)}\n.mka-stage-R03 .mka-dango-ball.is-current{z-index:2;transform:translateY(-8px) scale(1.08);border-color:#fff;box-shadow:inset -5px -7px 10px #5b351a1c,inset 5px 5px 8px #fff8,0 0 0 3px #fff4,0 8px 13px #54301866}\n.mka-stage-R03 .mka-dango-ball.mka-dango-added{animation:mka-dango-ball-pop .34s cubic-bezier(.2,.75,.3,1.3) both}\n.mka-stage-R03 .mka-dango-ball.is-roasted{animation:mka-dango-golden .38s ease-out both}\n.mka-stage-R03 .mka-dango-stick.is-finished{filter:drop-shadow(0 0 12px #fff0b8cc) drop-shadow(0 7px 5px #38241855)}\n.mka-stage-R03 .mka-roast-card{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:9px;width:min(92%,360px);margin:24px auto 0;padding:12px 16px 13px;border:1px solid #fff9;border-radius:17px;background:linear-gradient(145deg,#fffaf0ed,#f4e5d4e8);box-shadow:0 9px 24px #2c1d1540,inset 0 0 0 3px #fff8;backdrop-filter:blur(9px);text-align:center}\n.mka-stage-R03 .mka-roast-label{font-size:10px;letter-spacing:.12em;color:#897357}.mka-stage-R03 .mka-roast-message{min-height:25px;color:#544638;font-size:13px;font-weight:600}\n.mka-stage-R03 .mka-heat-meter{display:grid;grid-template-columns:repeat(3,minmax(74px,1fr));gap:6px;width:100%;margin-top:2px}\n.mka-stage-R03 .mka-heat-cell{display:flex;align-items:center;justify-content:center;gap:6px;min-height:36px;border:1px solid #dfd2bb;border-radius:9px;background:#f7f0e2;color:#9b8c74;transition:all .2s}\n.mka-stage-R03 .mka-heat-cell i{position:relative;width:11px;height:14px;border-radius:60% 40% 55% 45%;background:#c9bba1;transform:rotate(45deg)}\n.mka-stage-R03 .mka-heat-cell.is-active{border-color:#bd7f53;background:#fff0d5;color:#744a34;box-shadow:0 2px 7px #a35d3420}.mka-stage-R03 .mka-heat-cell.is-active i{background:linear-gradient(45deg,#c75b3d,#f3c06c);box-shadow:0 0 9px #e8a55388}\n.mka-stage-R03 .mka-finish-note{position:absolute;z-index:3;left:50%;bottom:3%;transform:translateX(-50%);display:grid;gap:2px;width:max-content;max-width:90%;padding:7px 13px;border:1px solid #fff9;border-radius:11px;background:#fff5e9e8;box-shadow:0 3px 10px #30201625;text-align:center;color:#5c5442;font-size:12px;backdrop-filter:blur(7px)}\n.mka-stage-R03 .mka-finish-note span{font-size:10px;color:#8c7a60}\n.mka-stage-R03 .mka-dango-seal{position:absolute;z-index:3;right:5%;top:27%;display:grid;justify-items:center;gap:2px;min-width:86px;padding:8px 9px;border:2px solid #a45d4d;border-radius:50%;background:#fff2e5dc;color:#945147;box-shadow:0 3px 9px #39211635;transform:rotate(8deg);animation:mka-dango-seal-in .42s ease-out both}\n.mka-stage-R03 .mka-dango-seal .mka-icon{width:24px;height:24px}.mka-stage-R03 .mka-dango-seal span{font-size:9px;line-height:1.3}.mka-stage-R03 .mka-dango-seal b{font-size:10px;font-weight:500}\n.mka-controls .mka-swatch:before{width:16px;height:16px;margin-right:7px;vertical-align:-3px;box-shadow:inset -2px -3px 4px #3d291c20,inset 2px 2px 3px #fff9,0 1px 3px #33231924}\n.mka-stage-R03 .mka-scene-caption{color:#fff8e8;background:#493627d9;border-color:#f0d8b088;box-shadow:0 3px 8px #20130f40}\n.mka-stage-R03:has(.mka-roast-card) .mka-dango-stick{bottom:8%}\n@keyframes mka-dango-seal-in{from{opacity:0;transform:rotate(18deg) scale(.6)}to{opacity:1;transform:rotate(8deg) scale(1)}}\n@keyframes mka-dango-ball-pop{from{opacity:.3;transform:translateY(18px) scale(.5)}to{opacity:1;transform:translateY(0) scale(1)}}\n@keyframes mka-dango-golden{45%{filter:brightness(1.25);box-shadow:inset -5px -7px 10px #5b351a1c,inset 5px 5px 8px #fff8,0 0 18px #ffd88a}}\n@media(max-width:520px){.mka-stage.mka-stage-R03{height:clamp(340px,103vw,400px);padding:52px 8px 10px}.mka-stage-R03 .mka-dango-steps{gap:5px;padding:6px 8px}.mka-stage-R03 .mka-dango-step{font-size:9px}.mka-stage-R03 .mka-roast-card{margin-top:21px;padding:10px 9px}.mka-stage-R03 .mka-heat-meter{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}.mka-stage-R03 .mka-heat-cell{min-height:34px;gap:4px;font-size:10px}.mka-stage-R03 .mka-dango-stick{bottom:13%;min-height:68px;padding:5px 10px}.mka-stage-R03:has(.mka-roast-card) .mka-dango-stick{bottom:7%}.mka-stage-R03 .mka-finish-note{bottom:2%}}\n@media(prefers-reduced-motion:reduce){.mka-stage-R03 .mka-dango-seal,.mka-stage-R03 .mka-dango-ball{animation:none!important}}\n\n/* R05 · route card and ordered travel stamps. */\n.mka-stage.mka-stage-R05{height:clamp(340px,76vw,430px);padding:53px 10px 12px}.mka-stage-R05 .mka-scene-art{object-position:center 64%;filter:saturate(.95)}\n.mka-stage-R05 .mka-ticket{position:relative;z-index:2;width:min(100%,390px);margin:12px auto 5px;padding:12px 15px;transform:rotate(-1deg);background:linear-gradient(140deg,#fffaf0f2,#f1e4d0ed);backdrop-filter:blur(7px)}\n.mka-stage-R05 .mka-ticket strong{display:block;font-size:17px}.mka-route-track{display:flex;align-items:flex-start;justify-content:space-between;gap:3px;position:relative;margin:15px 0 9px;padding-top:2px}.mka-route-track:before{content:\"\";position:absolute;top:12px;left:7%;right:7%;height:2px;background:repeating-linear-gradient(90deg,#ba9c73 0 7px,transparent 7px 11px)}\n.mka-route-stop{position:relative;z-index:1;display:grid;justify-items:center;gap:4px;width:25%;min-width:0;text-align:center}.mka-route-stop i{display:grid;place-items:center;width:24px;height:24px;border:1px solid #c4ad88;border-radius:50%;background:#fff8e9;color:#866a43;font:normal 10px/1 sans-serif}.mka-route-stop b{max-width:100%;color:#75654d;font-size:9px;font-weight:500;line-height:1.3;overflow-wrap:anywhere}.mka-route-stop.is-planned i{background:#718a6a;border-color:#718a6a;color:#fff}.mka-route-stop.is-destination i{background:#b9685a;border-color:#b9685a;color:#fff}.mka-route-stop.is-next i{border-style:dashed;background:#fff8;color:#9d8e72}.mka-ticket-stamps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}.mka-stamp-slot{position:relative;width:auto;height:54px;min-width:0;border-radius:8px;background:#fffcf3d9}.mka-stamp-slot small{position:absolute;left:3px;right:3px;top:3px;color:#8b7a60;font-size:8px;line-height:1.2;text-align:center}.mka-stamp-slot .mka-icon{width:26px;height:26px;margin-top:13px}.mka-stamp-slot>b{margin-top:11px;color:#b29a72;font-size:15px;font-weight:400}.mka-stamp-slot.is-active{border:2px solid #bd8c56;box-shadow:0 0 0 3px #f5dfb788,0 2px 8px #8e633433;animation:mka-ticket-pulse 1.4s ease-in-out infinite alternate}.mka-controls>.mka-route-choice,.mka-controls>.mka-stamp-choice{background:linear-gradient(#fff9ed,#efe1c9);border-color:#c5a87d;color:#5f5441}.mka-controls>.mka-route-choice:before{content:\"＋\";display:inline-block;margin-right:6px;color:#9c714a;font-size:13px}\n@keyframes mka-ticket-pulse{to{filter:brightness(1.08);transform:translateY(-2px)}}\n\n/* R07 · fingers or a large-button fallback reveal an actual canvas rubbing. */\n.mka-stage.mka-stage-R07{height:clamp(345px,78vw,420px);padding:51px 10px 12px}.mka-stage-R07 .mka-scene-art{object-position:center 56%}.mka-stage-R07 .mka-rubbing{position:relative;z-index:2;display:block;width:min(100%,460px);min-height:0;margin:34px auto 5px;padding:7px;border:1px solid #e8d9b7;border-radius:11px;background:#f7edd8ed;box-shadow:0 11px 25px #3429184a,inset 0 0 0 3px #fff9;transform:rotate(-1.5deg);backdrop-filter:blur(6px)}.mka-stage-R07 .mka-rubbing-canvas{display:block;width:100%;height:auto;aspect-ratio:2/1;border-radius:5px;touch-action:none;cursor:crosshair;box-shadow:inset 0 0 0 1px #c7b691}.mka-stage-R07 .mka-rubbing-canvas:focus-visible{outline:3px solid #a96570;outline-offset:2px}.mka-stage-R07 .mka-rubbing-done{position:absolute;z-index:3;right:8%;top:24%;display:grid;justify-items:center;gap:5px;padding:13px 16px;border:2px solid #a87062;border-radius:50%;background:#fff5e8e8;color:#92594b;box-shadow:0 4px 12px #37251e35;transform:rotate(8deg)}.mka-stage-R07 .mka-rubbing-done .mka-icon{width:25px;height:25px}.mka-stage-R07 .mka-rubbing-done b{font-size:10px;font-weight:500}\n\n/* R08 · four firefly lights and two increasingly long memory phrases. */\n.mka-stage.mka-stage-R08{height:clamp(330px,72vw,400px);padding:55px 12px 14px}.mka-stage-R08 .mka-scene-art{object-position:center 57%;filter:saturate(.92) brightness(.78)}.mka-stage-R08 .mka-scenery:after{background:linear-gradient(180deg,#0a143655 0%,transparent 48%,#101a3040 100%)}.mka-stage-R08 .mka-scene-caption{color:#f4edcf;background:#1c2635d9;border-color:#d3d5ad66}.mka-stage-R08 .mka-fireflies{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));align-items:center;justify-items:center;gap:clamp(4px,2vw,15px);min-height:175px;max-width:420px;margin:42px auto 3px}.mka-stage-R08 .mka-firefly.mka-button{width:100%;max-width:86px;height:110px;margin:0;padding:10px 3px;border:1px solid #dce9bf44;border-radius:50px 50px 22px 22px;background:#13213842;color:#bdcc9a;box-shadow:inset 0 0 0 3px #ffffff08;backdrop-filter:blur(3px)}.mka-stage-R08 .mka-firefly .mka-icon{width:36px;height:48px;margin:auto;display:block}.mka-stage-R08 .mka-firefly span{font-size:10px}.mka-stage-R08 .mka-firefly.mka-awake{border-color:#d9e6af8a;color:#e2edbd}.mka-stage-R08 .mka-firefly.mka-glow{color:#fff8c8;background:#e5f1af40;box-shadow:0 0 30px 12px #e9f3ac70;transform:translateY(-8px) scale(1.05)}.mka-stage-R08 .mka-firefly.mka-button:disabled{opacity:1}\n\n/* R09 · layered taiko canvas against the illustrated kagura hall. */\n.mka-stage.mka-stage-R09{height:clamp(340px,75vw,410px);padding:55px 10px 13px}.mka-stage-R09 .mka-scene-art{object-position:center 65%;filter:saturate(1.02)}.mka-stage-R09 .mka-drum{position:relative;z-index:2;width:min(55%,230px);margin:29px auto -8px;filter:drop-shadow(0 12px 9px #21171166);transition:transform .16s,filter .16s}.mka-stage-R09 .mka-drum-canvas{display:block;width:100%;height:auto;aspect-ratio:12/7}.mka-stage-R09 .mka-drum.mka-hit{filter:drop-shadow(0 0 16px #ffd48a9c) drop-shadow(0 9px 6px #21171166)}.mka-stage-R09 .mka-beats{position:relative;z-index:2;width:max-content;max-width:100%;margin:9px auto 4px;padding:7px 10px;border:1px solid #fff8;border-radius:999px;background:#fff4e3e8;box-shadow:0 3px 9px #25170f40;backdrop-filter:blur(5px)}.mka-stage-R09 .mka-beat{width:39px;height:39px;border-color:#d1b895;background:#fff9ed;color:#8b775d;font-size:13px}.mka-stage-R09 .mka-beat-next{border:2px solid #b16f4b;background:#fff1d2;color:#793f31;box-shadow:0 0 0 3px #efca9277,0 3px 8px #6129182a;transform:translateY(-3px)}.mka-stage-R09 .mka-beat-done{border-color:#728966;background:#dfe9d0;color:#526c4b}\n\n/* R10 · night scene, route-shaped lantern board and warm layered light. */\n.mka-stage.mka-stage-R10{height:clamp(345px,77vw,420px);padding:55px 10px 12px}.mka-stage-R10 .mka-scene-art{object-position:center 60%;filter:saturate(.93) brightness(.78)}.mka-stage-R10 .mka-scenery:after{background:linear-gradient(180deg,#10182747 0%,transparent 38%,#131a2140 100%)}.mka-stage-R10 .mka-scene-caption{color:#fff3d2;background:#263040d9;border-color:#e6c77a66}.mka-stage-R10 .mka-lanterns{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:center;gap:8px;max-width:370px;min-height:205px;margin:24px auto 1px;padding:14px 11px;border:1px solid #fff2;border-radius:18px;background:linear-gradient(155deg,#19263755,#0e17243b);box-shadow:inset 0 0 0 2px #ffffff0b;backdrop-filter:blur(3px)}.mka-stage-R10 .mka-lanterns:before{content:\"\";position:absolute;inset:17% 16%;z-index:-1;border:2px dashed #f4d99a36;border-radius:50%;transform:rotate(-10deg)}.mka-stage-R10 .mka-lantern.mka-button{height:82px;min-height:72px;border:1px solid #fff2;border-radius:17px 17px 13px 13px;background:#ffffff08;color:#d9d6bd88;box-shadow:inset 0 0 0 2px #fff1,0 4px 10px #090e1640;transition:all .25s}.mka-stage-R10 .mka-lantern .mka-icon{width:34px;height:43px;stroke-width:1.2}.mka-stage-R10 .mka-lantern span{font-size:10px}.mka-stage-R10 .mka-lantern.mka-lantern-lit{border-color:#fff5c77c;background:#ffd77a20;color:#f8dfa1;box-shadow:0 0 18px #ffd77a50,inset 0 0 0 2px #fff2}.mka-stage-R10 .mka-lantern.mka-sakura{color:#ffd1df;background:#d67d9a24;box-shadow:0 0 18px #f0a7c24d}.mka-stage-R10 .mka-lantern.mka-jade{color:#c9f2d5;background:#7bc99c24;box-shadow:0 0 18px #8ddba34d}\n@media(max-width:520px){.mka-stage.mka-stage-R05{height:clamp(345px,96vw,390px);padding:51px 7px 9px}.mka-stage-R05 .mka-ticket{margin-top:24px;padding:10px 9px}.mka-route-stop b{font-size:8px}.mka-stage.mka-stage-R07{height:clamp(350px,98vw,395px);padding:51px 7px 8px}.mka-stage-R07 .mka-rubbing{margin-top:35px;padding:5px}.mka-stage.mka-stage-R08{height:clamp(330px,90vw,370px);padding:52px 7px 8px}.mka-stage-R08 .mka-fireflies{gap:4px;margin-top:48px}.mka-stage-R08 .mka-firefly.mka-button{height:94px}.mka-stage.mka-stage-R09{height:clamp(345px,95vw,390px);padding:52px 6px 8px}.mka-stage-R09 .mka-drum{width:min(58%,210px);margin-top:38px}.mka-stage-R09 .mka-beat{width:35px;height:35px}.mka-stage.mka-stage-R10{height:clamp(345px,96vw,395px);padding:52px 6px 8px}.mka-stage-R10 .mka-lanterns{gap:5px;min-height:195px;margin-top:28px;padding:10px 5px}.mka-stage-R10 .mka-lantern.mka-button{height:73px;min-height:68px}}\n@media(prefers-reduced-motion:reduce){.mka-stage-R05 .mka-stamp-slot.is-active{animation:none!important}}\n\n/* Hand-painted CSS sprites keep the two night games crisp without SVG gameplay art. */\n.mka-stage-R08 .mka-firefly-sprite{position:relative;display:block;width:36px;height:48px;margin:auto;background:radial-gradient(ellipse at 50% 58%,#fff9c7 0 8%,#d9f4a8 11% 20%,#c5e89a22 28%,transparent 64%);filter:drop-shadow(0 0 5px #def3a56b)}\n.mka-stage-R08 .mka-firefly-sprite:before{content:\"\";position:absolute;left:3px;top:13px;width:30px;height:15px;border:0;border-radius:50%;background:radial-gradient(ellipse at 28% 58%,#dbe8c2bb 0 23%,#a6bc9570 45%,transparent 72%),radial-gradient(ellipse at 72% 58%,#dbe8c2bb 0 23%,#a6bc9570 45%,transparent 72%);transform:rotate(-8deg)}\n.mka-stage-R08 .mka-firefly-sprite:after{content:\"\";position:absolute;left:15px;top:13px;width:7px;height:27px;border-radius:55% 55% 48% 48%;background:radial-gradient(circle at 50% 8%,#cdd4b4 0 2px,transparent 2.5px),linear-gradient(#384332 0 27%,#e7f6b4 40%,#d8ee9c 76%,#83965c 100%);box-shadow:0 0 11px 4px #e7f7bbaa}\n.mka-stage-R08 .mka-firefly.mka-glow .mka-firefly-sprite{filter:drop-shadow(0 0 12px #f7ffc6)}\n.mka-stage-R10 .mka-lantern-sprite{position:relative;display:block;width:29px;height:36px;margin:0 auto 3px;border:1px solid #fff3;border-radius:45% 45% 36% 36%;background:linear-gradient(90deg,#8f71494a,#ffe4ab9c 27% 72%,#8f71494a);box-shadow:inset 0 0 8px #ffe8ba55,0 2px 4px #050a103c}\n.mka-stage-R10 .mka-lantern-sprite:before{content:\"\";position:absolute;left:3px;right:3px;top:-4px;height:3px;border-radius:50%;background:#dac7a0;box-shadow:0 40px 0 -0.5px #d0bd96}.mka-stage-R10 .mka-lantern-sprite:after{content:\"\";position:absolute;inset:0 7px;border-left:1px solid #fff4;border-right:1px solid #fff4;border-radius:50%}\n.mka-stage-R10 .mka-lantern.mka-lantern-lit .mka-lantern-sprite{background:linear-gradient(90deg,#b88743,#fff1b9 35% 68%,#b88743);box-shadow:0 0 15px #ffe79c,inset 0 0 8px #fff7}.mka-stage-R10 .mka-lantern.mka-sakura .mka-lantern-sprite{background:linear-gradient(90deg,#a45d72,#ffd5df 35% 68%,#a45d72);box-shadow:0 0 15px #f4b4ca,inset 0 0 8px #fff8}.mka-stage-R10 .mka-lantern.mka-jade .mka-lantern-sprite{background:linear-gradient(90deg,#4d8062,#d6f6dc 35% 68%,#4d8062);box-shadow:0 0 15px #a2efbc,inset 0 0 8px #fff8}\n\n:host{all:initial;color:#35463d;font-family:\"Mikage Serif\",-apple-system,BlinkMacSystemFont,\"Noto Sans SC\",sans-serif}\n.mkg-overlay,.mkg-overlay *{box-sizing:border-box}\n.mkg-overlay{position:fixed;inset:0;display:grid;place-items:center;padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));background:radial-gradient(ellipse at 50% 8%,#283a34c7,#151d1bec 68%);backdrop-filter:blur(8px);overflow:auto;opacity:0;animation:mkg-fade-in .18s ease-out forwards}\n.mkg-dialog{position:relative;width:min(940px,100%);max-height:min(940px,calc(100dvh - 24px));overflow:auto;border:1px solid #c7b68f;border-radius:18px;background:#fbf6e8;box-shadow:0 25px 90px #1017118c,inset 0 0 0 4px #f5ecd7;overscroll-behavior:contain;animation:mkg-rise-in .24s cubic-bezier(.2,.7,.25,1) both;scrollbar-color:#c3ad84 transparent;scrollbar-width:thin}\n.mkg-topbar{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:65px;padding:11px clamp(14px,3vw,26px);border-bottom:1px solid #e4dac2;background:#fbf6e8ed;backdrop-filter:blur(12px)}\n.mkg-brand{display:grid;gap:3px;min-width:0}.mkg-eyebrow,.mkg-section-label{font:10px/1.4 system-ui,sans-serif;letter-spacing:.18em;color:#8f8063}.mkg-brand strong{font-size:14px;font-weight:500;letter-spacing:.12em;color:#52654e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.mkg-close{flex:none;width:42px;height:42px;border:1px solid #d6c9a9;border-radius:50%;background:#f6efdd;color:#765c4c;font:26px/1 sans-serif;cursor:pointer}.mkg-close:hover{background:#eee2c7}.mkg-close:focus-visible,.mkg-dialog button:focus-visible{outline:3px solid #b16c75;outline-offset:3px}\n.mkg-intro{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(260px,.88fr);min-height:320px}.mkg-visual{position:relative;min-height:320px;overflow:hidden;background:linear-gradient(145deg,#c3d1bf,#f2e5cb 55%,#859a80);isolation:isolate}.mkg-visual:before,.mkg-visual:after{content:\"\";position:absolute;z-index:1;pointer-events:none}.mkg-visual:before{inset:0;background:linear-gradient(0deg,#1a2924a8,transparent 50%),linear-gradient(110deg,#d4ddd42c,#273e331c)}.mkg-visual:after{width:52%;height:60%;right:-10%;bottom:-16%;border:1px solid #fff8;border-radius:50%;box-shadow:0 0 0 22px #fff2,0 0 0 45px #fff1;opacity:.6}\n.mkg-visual[data-region=\"R01\"]{background:linear-gradient(#e5e0cb 0 37%,#c4d0b8 38% 70%,#aab796)}.mkg-visual[data-region=\"R03\"]{background:radial-gradient(ellipse at 50% 82%,#d5a27e 0 14%,transparent 15%),linear-gradient(135deg,#ead7c3,#e8c9b9 55%,#b6c7ae)}.mkg-visual[data-region=\"R05\"]{background:linear-gradient(0deg,#7f9287 0 17%,#c6c7b4 18% 20%,transparent 21%),linear-gradient(#dae4de,#f1e6d3)}.mkg-visual[data-region=\"R07\"]{background:radial-gradient(ellipse at 18% 40%,#718b6d 0 23%,transparent 24%),radial-gradient(ellipse at 84% 27%,#819577 0 27%,transparent 28%),linear-gradient(#d7e2d3,#e7dfca 62%,#b6c39f)}.mkg-visual[data-region=\"R08\"]{background:radial-gradient(circle at 68% 37%,#fff2bf 0 2px,transparent 4px),radial-gradient(circle at 42% 56%,#ffe7a1 0 2px,transparent 4px),linear-gradient(#46546a,#9aab99 70%,#788c7c)}.mkg-visual[data-region=\"R09\"]{background:radial-gradient(ellipse at 50% 70%,#b27d57 0 25%,transparent 26%),linear-gradient(125deg,#e6d7c3,#d5c3a9 55%,#b3c0a4)}.mkg-visual[data-region=\"R10\"]{background:radial-gradient(circle at 50% 42%,#ffe3a270 0 10%,transparent 42%),linear-gradient(#43495a,#8b806e 68%,#485c4d)}\n.mkg-cover{position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;image-rendering:auto}.mkg-cat{position:absolute;right:7%;bottom:5%;z-index:2;width:min(33%,170px);height:64%;object-fit:contain;filter:drop-shadow(0 8px 5px #30423055)}.mkg-placard{position:absolute;z-index:2;left:20px;bottom:18px;padding:7px 11px;border:1px solid #fff7;background:#24372edb;color:#fff6df;font:10px/1.4 system-ui,sans-serif;letter-spacing:.12em;backdrop-filter:blur(6px)}\n.mkg-copy{display:flex;flex-direction:column;justify-content:center;padding:clamp(22px,4vw,42px);background:linear-gradient(145deg,#fffaf0,#f6efdf)}.mkg-section-label{display:flex;align-items:center;gap:10px}.mkg-section-label:before{content:\"\";width:24px;height:1px;background:#b98c64}.mkg-copy h2{margin:11px 0 12px;color:#475d4a;font-size:clamp(22px,3.3vw,31px);font-weight:500;letter-spacing:.08em;line-height:1.35}.mkg-description{margin:0;color:#6f7163;font-size:14px;line-height:1.9}.mkg-tags{display:grid;gap:7px;margin:18px 0 0;padding:0;list-style:none}.mkg-tags li{position:relative;padding-left:17px;color:#8a785c;font-size:12px;line-height:1.6}.mkg-tags li:before{content:\"✦\";position:absolute;left:0;top:1px;color:#b68762;font-size:11px}\n.mkg-actions{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px clamp(16px,3vw,26px);border-top:1px solid #e3d8bf;background:#f7f0df}.mkg-footnote{margin:0;color:#948a72;font-size:11px;line-height:1.7}.mkg-action-buttons{display:flex;flex:none;gap:9px}.mkg-action-buttons button{min-height:46px;padding:9px 17px;border-radius:10px;font:inherit;cursor:pointer;touch-action:manipulation}.mkg-begin{border:1px solid #536e56;background:#657e60;color:#fffaf0;box-shadow:0 3px 0 #455c48}.mkg-begin:hover{background:#536e56;transform:translateY(-1px)}.mkg-leave{border:1px solid #d4c7a7;background:transparent;color:#786d59}.mkg-leave:hover{background:#eee5d0}\n.mkg-game{padding:clamp(12px,3vw,26px);background:radial-gradient(ellipse at 50% 0,#fffdf6,#f4eddd 72%)}.mkg-game[hidden],.mkg-intro[hidden],.mkg-actions[hidden]{display:none!important}.mkg-game .mka{max-width:790px;padding:clamp(13px,2.8vw,26px);border-radius:16px;background:#fffdf6;box-shadow:0 10px 32px #35433110}.mkg-game .mka-stage{min-height:300px}.mkg-game .mka-result{animation:mkg-stamp-in .28s ease-out both}\n@keyframes mkg-fade-in{to{opacity:1}}@keyframes mkg-rise-in{from{opacity:0;transform:translateY(12px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes mkg-stamp-in{from{opacity:0;transform:scale(.94) rotate(-1deg)}to{opacity:1;transform:scale(1) rotate(0)}}\n@media(max-width:700px){.mkg-intro{grid-template-columns:1fr}.mkg-visual{min-height:clamp(190px,42vw,310px);max-height:34dvh}.mkg-copy{padding:20px 22px}.mkg-tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.mkg-tags li{padding:4px 8px;border:1px solid #e2d8bf;border-radius:999px;background:#fbf6e8}.mkg-tags li:before{content:none}.mkg-actions{align-items:flex-start;flex-direction:column}.mkg-action-buttons{width:100%}.mkg-action-buttons button{flex:1}.mkg-game .mka-stage{min-height:250px}}\n@media(max-width:420px){.mkg-overlay{padding:8px}.mkg-dialog{max-height:calc(100dvh - 16px);border-radius:14px}.mkg-topbar{min-height:56px;padding:8px 12px}.mkg-eyebrow{font-size:9px}.mkg-brand strong{font-size:12px}.mkg-copy{padding:17px}.mkg-copy h2{font-size:22px;margin:7px 0}.mkg-description{font-size:13px}.mkg-actions{padding:12px 14px}.mkg-footnote{font-size:10px}.mkg-game{padding:8px}.mkg-game .mka{padding:12px;border-radius:12px}.mkg-game .mka-stage{min-height:235px}}\n@media(prefers-reduced-motion:reduce){.mkg-overlay,.mkg-dialog,.mkg-game .mka-result{animation:none;opacity:1}.mkg-action-buttons button{transition:none}}\n";
const ART = {"R01": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c/mikage-shrine/assets/activities/r01-courtyard-v1.webp", "R02": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c/mikage-shrine/assets/activities/r02-garden-v1.webp", "R03": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@973b2148fa78fd053a667fd58c74f3e141e085b9/mikage-shrine/assets/activities/r03-dango-shop-v1.webp", "R04": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c/mikage-shrine/assets/activities/r04-stream-v1.webp", "R05": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@973b2148fa78fd053a667fd58c74f3e141e085b9/mikage-shrine/assets/activities/r05-ticket-station-v1.webp", "R06": {"day": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@8bd6001ee4595c0a4ccadbcab8736308c0c39633/mikage-shrine/assets/regions/time-of-day/r06-day.webp", "dusk": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c/mikage-shrine/assets/activities/r06-coastal-platform-v1.webp", "night": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@8bd6001ee4595c0a4ccadbcab8736308c0c39633/mikage-shrine/assets/regions/time-of-day/r06-night.webp"}, "R07": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@973b2148fa78fd053a667fd58c74f3e141e085b9/mikage-shrine/assets/activities/r07-leaf-grove-v1.webp", "R08": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@973b2148fa78fd053a667fd58c74f3e141e085b9/mikage-shrine/assets/activities/r08-firefly-marsh-v1.webp", "R09": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@973b2148fa78fd053a667fd58c74f3e141e085b9/mikage-shrine/assets/activities/r09-taiko-hall-v1.webp", "R10": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@973b2148fa78fd053a667fd58c74f3e141e085b9/mikage-shrine/assets/activities/r10-lantern-path-v1.webp", "cat": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c/mikage-shrine/assets/activities/neighborhood-cat-v1.webp"};
const GAME_FONT_URL = "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@b6d0a11791e2b676d0107ee9412ae8fddd7f66ca/mikage-shrine/assets/opening/minigames-v112-glyphs.ttf";

/* Mikage Shrine · ten replayable, choice-led moments. Small DOM/SVG scenes, with project art loaded on demand. */
function createMikageActivities(global) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const ICONS = {
    retry:'M4 9a8 8 0 1 1 0 7M4 3v6h6',
    close:'M6 6l12 12M18 6 6 18',
    leaf:'M12 21C1 17 4 4 22 3c0 16-6 20-10 18ZM7 18 19 7m-9 8-1-5m5 1 4 1',
    ginkgo:'M12 22v-9M12 16C5 17 0 11 2 7l6-4 4 3 4-3 6 4c2 4-3 10-10 9ZM12 16 7 6m5 10 5-10M12 16V7',
    camellia:'M12 22V9M12 19C1 14 4 3 12 2c8 1 11 12 0 17ZM12 9 8 6m4 7 5-6m-5 9-5-5',
    cat:'M5 10 4 3l6 4h4l6-4-1 8c4 9-18 13-14-1ZM9 12h.1m6-.1h.1M11 16h2M2 14l5 1m10 0 5-1',
    dango:'M12 2v21M17 6a5 4 0 1 1-10 0 5 4 0 1 1 10 0Zm0 7a5 4 0 1 1-10 0 5 4 0 1 1 10 0Zm0 7a5 4 0 1 1-10 0 5 4 0 1 1 10 0Z',
    boat:'m2 14 6 7h10l4-7H2Zm5 0 5-11 5 11M12 3v11M1 23q5-3 10 0t12 0',
    ticket:'M3 5h18v5a3 3 0 0 0 0 6v4H3v-4a3 3 0 0 0 0-6V5Zm12 0v15M7 10h4m-4 5h4',
    tram:'M5 3h14v15H5V3Zm0 10h14M8 18l-2 4m10-4 2 4M8 16h.1m8 0h.1M9 3V1h6v2M5 9h14',
    fern:'M12 23V3m0 5C6 8 4 4 5 2c5 0 7 3 7 6Zm0 5C4 13 2 9 3 7c6 0 9 3 9 6Zm0 5C5 18 2 15 2 13c7-1 10 1 10 5ZM12 9c7-1 9-4 9-6-6 0-9 2-9 6Zm0 7c8 0 11-4 10-7-7 0-10 3-10 7Z',
    firefly:'M12 8v14m0-11c-8-9-12 4-1 4m2-4c8-9 12 4 1 4M9 4l3 4 3-4M9 19h6',
    drum:'M4 7c0-6 16-6 16 0v11c0 6-16 6-16 0V7Zm0 0c0 6 16 6 16 0M6 11l12 10M18 11 6 21M2 1l5 4m15-4-5 4',
    lantern:'M7 4h10l4 6v6l-4 5H7l-4-5v-6l4-6Zm0 0h10M8 2h8M8 23h8M8 5l-2 8 2 7m8-15 2 8-2 7M3 12h18',
    heart:'M12 21C-8 8 5-3 12 6c7-9 20 2 0 15Z',
    seal:'m12 2 3 3 4-1 1 4 3 3-2 4 1 4-5 1-3 3-4-2-4 1-1-5-3-3 2-4-1-4 5-1 3-3ZM8 12l3 3 5-6',
    lighthouse:'m8 21 2-13h4l2 13M7 8h10l-5-6-5 6ZM9 14h6M1 5l5 1m12 0 5-1M5 23h14',
  };
  const META = {
    R01:['leaf','一篮庭院秋色','先听风，再把散落的叶子拢起来，决定庭院要留下怎样的秋色。','庭前拾叶','把庭院收拾成自己喜欢的样子。'],
    R02:['cat','与猫慢慢熟悉','蹲下来观察它的耳朵和尾巴，再选择一种它觉得舒服的相处方式。','猫的信任','猫记住了你的动作，也按自己的节奏回应了你。'],
    R03:['dango','串起一签春色','搭配三颗团子、逐颗调好火候，再选蘸料与点缀，做成只属于今天的一签点心。','春日手作','按喜欢的顺序搭配团子，观察火候烤出金边，再配上蘸料与最后点缀。'],
    R04:['boat','让纸舟顺水走','先决定船形与纸色，再观察水流，给小舟选一条合适的路线。没有时间限制。','纸舟顺流','为纸舟选好船形，在不同水势间调整航线，让它沿溪漂远。'],
    R05:['ticket','等车时的一枚票根','挑定目的方向，串起两处停靠站，再逐站盖印，排成一段完整的小旅行。','站前旅票','从站前出发，按顺序安排两处停靠与终点，再为每一站盖上不同纪念印。'],
    R06:['tram','海风寄来的明信片','在安全的站台上选一个取景主题与相框，等海风把这一刻送进卡片。','海风邮戳','从临海电车站台拍下一张构图与装饰都由自己选择的明信片。'],
    R07:['fern','收集一页叶拓','沿着脚印、树皮或落叶找到三种叶片，再在拓纸上亲手来回压印。','草木叶拓','循着林间线索找到三种叶片，在拓纸上慢慢压出带颜色的叶脉。'],
    R08:['firefly','跟着微光呼吸','选择听芦苇还是看水面，记住两段逐渐变长的萤火顺序；可以随时重看。','微光同行','循着自己选择的线索，记住两段萤火顺序，在夜色里慢慢跟上。'],
    R09:['drum','神乐前的三拍练习','选择稳拍或轻快合拍，跟着三段逐渐变化的四拍节奏敲鼓；也能自由合奏。','太鼓三拍','选好节奏后跟上三段四拍节奏，敲出属于今晚的合奏。'],
    R10:['lantern','把归途慢慢点亮','先挑灯路和灯色，再逐盏点亮，可以随时改动摆放前的配色。','灯下归途','选好灯路与灯色，点亮六盏纸灯，为归途留下一片温柔的光。'],
  };
  function el(tag, cls, text) { const n=document.createElement(tag); if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n; }
  function icon(name, cls) {
    const s=document.createElementNS(NS,'svg'); s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('class',`mka-icon ${cls||''}`);
    const p=document.createElementNS(NS,'path');p.setAttribute('d',ICONS[name]||ICONS.seal);s.append(p);return s;
  }
  function mount(container, options) {
    if (!container || typeof container.append !== 'function') throw new TypeError('MikageActivities requires a DOM container');
    const opts=options||{};
    const region=typeof opts.region==='string'?opts.region:(opts.region?.id||opts.region?.key||opts.region?.code||'R01');
    if (!META[region]) throw new RangeError(`Unknown activity region: ${region}`);
    const meta=META[region];
    let disposed=false,completed=false,generation=0,audio=null,sound=false;
    const timers=new Set();
    let state;
    const root=el('section','mka'+(opts.reducedMotion?' mka-reduced':''));root.dataset.region=region;root.dataset.period=opts.period||'day';root.setAttribute('aria-label',meta[1]);
    const heading=el('header','mka-heading');const emblem=el('span','mka-emblem');emblem.append(icon(meta[0]));
    const headingText=el('div');headingText.append(el('span','mka-kicker','御影 · 漫游小事'),el('h3','mka-title',meta[1]));heading.append(emblem,headingText);
    const help=el('p','mka-help',meta[2]);
    const stage=el('div',`mka-stage mka-stage-${region}`);
    stage.dataset.period=opts.period||'day';
    const progress=el('p','mka-progress');progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');progress.setAttribute('aria-atomic','true');
    const controls=el('div','mka-controls');
    const result=el('div','mka-result');result.hidden=true;result.setAttribute('role','status');
    const footer=el('footer','mka-footer');
    function button(text, action, cls, parent=controls) {const b=el('button',`mka-button ${cls||''}`,text);b.type='button';b.setAttribute('aria-label',text);b.addEventListener('click',()=>{if(!disposed)action(b);});parent.append(b);return b;}
    const replay=button('再玩一次',reset,'mka-quiet',footer);replay.prepend(icon('retry'));
    const close=button('收起小舞台',()=>{if(typeof opts.onClose==='function')opts.onClose();},'mka-quiet',footer);close.prepend(icon('close'));
    root.append(heading,help,stage,progress,controls,result,footer);container.append(root);
    function say(text){progress.textContent=text;}
    function clear(){stage.replaceChildren();controls.replaceChildren();}
    function later(fn,ms){const t=setTimeout(()=>{timers.delete(t);if(!disposed)fn();},ms);timers.add(t);}
    function cancelTimers(){timers.forEach(clearTimeout);timers.clear();}
    function assetUrl(assetKey){const source=assetKey&&opts.art?.[assetKey];const url=typeof source==='string'?source:(source?.[opts.period]||source?.default);return typeof url==='string'&&/^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(url)?url:null;}
    function finish(detail){
      if(completed||disposed)return;completed=true;
      result.hidden=false;result.replaceChildren(icon('seal'),el('div','',`小事完成 · ${meta[3]}`),el('p','',detail||meta[4]));
      say('这一刻已经收好。也可以再玩一次，换一种搭配。');
      if(typeof opts.onComplete==='function')opts.onComplete({region,title:meta[1],detail:detail||meta[4],stamp:meta[3]});
    }
    function sceneCaption(text){stage.append(el('div','mka-scene-caption',text));}
    function scenery(kind,assetKey){
      const n=el('div',`mka-scenery mka-scenery-${kind}`);n.setAttribute('aria-hidden','true');
      const url=assetUrl(assetKey);
      if(url){
        const art=el('img','mka-scene-art');art.alt='';art.decoding='async';art.loading='eager';art.src=url;art.addEventListener('error',()=>art.remove(),{once:true});n.append(art);
      }
      stage.append(n);return n;
    }
    function choice(text,action,selected=false){const b=button(text,action,selected?'mka-selected':'');b.setAttribute('aria-pressed',String(selected));return b;}
    function reset(){
      cancelTimers();generation++;completed=false;result.hidden=true;
      state={step:0,selected:[],count:0,stage:0};clear();render();
    }
    function render(){
      if(disposed)return;
      const active=document.activeElement;
      const restoreFocus=!!active&&root.contains(active);
      const activeLabel=restoreFocus?active.getAttribute('aria-label'):null;
      clear();handlers[region]();
      if(restoreFocus){
        const available=Array.from(root.querySelectorAll('button')).filter(b=>!b.disabled);
        const matching=activeLabel?available.find(b=>b.getAttribute('aria-label')===activeLabel):null;
        const target=matching||stage.querySelector('button:not(:disabled)')||controls.querySelector('button:not(:disabled)');
        target?.focus({preventScroll:true});
      }
    }
    const handlers={
      R01(){
        scenery('courtyard','R01');sceneCaption('听一听风，再决定叶子要去哪里。');
        const wind=state.wind||'soft';stage.dataset.wind=wind;
        if(!state.wind){say('今天的风是什么样的？它会改变叶片落下的方向。');[['soft','微风'],['cross','穿堂风'],['west','西风']].forEach(([key,label])=>choice(label,()=>{state.wind=key;render();},wind===key));return;}
        const pile=el('div','mka-leaves');
        const positions=[[15,20,-28],[65,12,35],[37,45,-15],[74,59,70],[11,65,10]];
        positions.forEach(([x,y,r],i)=>{
          if(state.selected.includes(i))return;
          const b=button(`收起第${i+1}片落叶`,()=>{state.selected.push(i);render();},'mka-leaf',pile);
          b.style.cssText=`left:${x}%;top:${y}%;--turn:${r}deg`;b.replaceChildren(icon('leaf'));b.setAttribute('aria-label',`收起第${i+1}片落叶`);
        });
        stage.append(pile);const basket=el('div','mka-basket');
        basket.append(el('span','',`竹篮 · ${state.selected.length}/5`));
        const gathered=el('div','mka-gathered');state.selected.forEach((_,i)=>{const n=icon('leaf');n.style.setProperty('--turn',`${i*23-35}deg`);gathered.append(n);});basket.append(gathered);stage.append(basket);
        if(state.selected.length<5){say(`已经收好 ${state.selected.length}/5 片。点一片叶子，看它顺着${{soft:'微风',cross:'穿堂风',west:'西风'}[wind]}落进篮里。`);return;}
        say('庭院已经收拾好了。最后决定扫清参道，还是为树下留一片秋色。');
        button('扫净石阶，铺出清爽归路',()=>{state.leafChoice='clear';finish(`在${{soft:'微风',cross:'穿堂风',west:'西风'}[wind]}里收好五片落叶，扫净石阶，让来参拜的人好好走一段路。`);});
        button('树下留几片，铺成柔软一角',()=>{state.leafChoice='keep';finish(`在${{soft:'微风',cross:'穿堂风',west:'西风'}[wind]}里收好五片落叶，也为树下留了一小片秋色。`);});
      },
      R02(){
        scenery('garden','R02');sceneCaption('看它的耳朵和尾巴，决定给它多大的空间。');
        const cat=el('div','mka-cat'+(state.approach?' mka-cat-near':'')+(state.approach==='toy'?' mka-cat-curious':''));
        let catArt;if(assetUrl('cat')){catArt=el('img','mka-cat-art');catArt.alt='';catArt.setAttribute('aria-hidden','true');catArt.src=assetUrl('cat');catArt.addEventListener('error',()=>catArt.replaceWith(icon('cat','mka-cat-fallback')),{once:true});}else catArt=icon('cat','mka-cat-fallback');cat.append(catArt,el('span','',state.approach?(state.approach==='toy'?'它先看了看玩具，又看向你':'它发现你没有盯着它，耳朵慢慢放松'):'它躲在花盆边，耳朵轻轻转动'));stage.append(cat);
        if(!state.approach){say('先选一种靠近它的方式，之后也可以停下来，不需要摸它。');button('把小玩具放在不远处',()=>{state.approach='toy';state.step=1;render();});button('蹲下后移开视线',()=>{state.approach='quiet';state.step=1;render();});return;}
        if(state.step===1){
          say(state.approach==='toy'?'玩具停在它能自己选择的位置。接下来要不要招呼它？':'你把目光转向一旁，它开始好奇地观察你。');
          button('轻声叫它的名字',()=>{state.step=2;state.response='call';render();finish(state.approach==='toy'?'猫先嗅了嗅玩具，才慢慢走近你。你没有伸手催它。':'猫确认你没有逼近，自己走到了你身边。你轻声叫了它一声。');});
          button('继续安静陪它一会儿',()=>{state.step=2;state.response='wait';render();finish(state.approach==='toy'?'猫在玩具旁边坐下来，尾巴轻轻绕住了爪子。':'猫在你身边找了个舒服的位置，慢慢把眼睛闭上。');});
        }
      },
      R03(){
        scenery('dango','R03');
        sceneCaption(['捏制三颗团子','看香气调火候 · 不限时','选蘸料与最后点缀','春日小签已完成'][state.step]||'串起一签春色');
        const palette=[['樱粉','#e5a0ae'],['米白','#f5e7c9'],['抹茶','#8fae78']];
        const sauces=[['honey','黑蜜黄豆粉'],['berry','樱花糖霜'],['tea','抹茶碎']];
        const toppings=[['petal','盐渍樱花'],['kinako','黄豆粉'],['tea','茶叶细末']];
        state.roastIndex ??= 0;state.heat ??= 1;state.roasted ||= [];
        const phase=Math.min(state.step,2);
        const steps=el('div','mka-dango-steps');
        [['捏制',0],['烘烤',1],['点睛',2]].forEach(([label,index])=>{const item=el('span',`mka-dango-step${phase===index?' is-current':''}${phase>index?' is-done':''}`);item.append(el('i','',phase>index?'✓':String(index+1)),el('b','',label));steps.append(item);});stage.append(steps);
        const stick=el('div',`mka-dango-stick${state.step>=3?' is-finished':''}`);stick.setAttribute('aria-label','三颗团子串');
        for(let i=0;i<3;i++){
          const dot=el('span',`mka-dango-ball${state.roasted[i]?' is-roasted':''}`);const value=state.selected[i];
          if(value!==undefined){dot.style.setProperty('--ball-color',palette[value][1]);dot.dataset.flavor=['sakura','milk','matcha'][value];dot.setAttribute('aria-label',`${palette[value][0]}团子${state.roasted[i]?'，已烤好':''}`);}
          else {dot.textContent='+';dot.setAttribute('aria-label',`第${i+1}颗待选`);}
          if(state.step===1&&i===state.roastIndex)dot.classList.add('is-current');
          if(state.justAdded===i)dot.classList.add('mka-dango-added');
          if(state.sauce)dot.dataset.sauce=state.sauce;
          stick.append(dot);
        }
        if(state.garnish)stick.dataset.garnish=state.garnish;
        stage.append(stick);state.justAdded=null;

        if(state.step===0){
          say(`捏制面团 · ${state.selected.length}/3。按顺序挑颜色，重复搭配也可以。`);
          palette.forEach(([name,color],i)=>{const b=button(name,()=>{if(state.selected.length<3){state.selected.push(i);state.justAdded=state.selected.length-1;}render();});b.style.setProperty('--swatch',color);b.classList.add('mka-swatch');b.disabled=state.selected.length>=3;});
          const undo=button('撤回最后一颗',()=>{state.selected.pop();render();},'mka-quiet');undo.disabled=!state.selected.length;
          if(state.selected.length===3)button('开始慢火烘烤',()=>{state.step=1;state.roastIndex=0;state.heat=1;render();});
          return;
        }

        if(state.step===1){
          const index=state.roastIndex,colorIndex=state.selected[index],name=palette[colorIndex][0];
          const target=(colorIndex+index)%3;
          const roast=el('div',`mka-roast-card heat-${state.heat}`);
          roast.append(el('span','mka-roast-label',`第 ${index+1} 颗 · ${name}`),el('strong','mka-roast-message',state.roastFeedback||'看着团子表面的细纹，慢慢调火。'));
          const meter=el('div','mka-heat-meter');meter.setAttribute('aria-label',`当前${['微火','中火','旺火'][state.heat]}`);
          ['微火','中火','旺火'].forEach((label,i)=>{const cell=el('span',`mka-heat-cell${state.heat===i?' is-active':''}`);cell.append(el('i',''),el('b','',label));meter.append(cell);});
          roast.append(meter);stage.append(roast);
          say(`慢火烘烤 · ${index+1}/3。先试火候，再翻面观察；不合适可以调火重试。`);
          if(state.heat>0)button('收一档火',()=>{state.heat--;state.roastFeedback='火苗收稳了，再翻面看看。';render();});
          if(state.heat<2)button('添一档火',()=>{state.heat++;state.roastFeedback='火力升了一档，再翻面看看。';render();});
          button('翻面看火候',()=>{
            if(state.heat!==target){state.roastFeedback=state.heat<target?'香气还没醒，添一档火再看看。':'边缘起焦香了，收一档火再翻面。';render();return;}
            state.roasted[index]=true;state.roastFeedback='';state.roastIndex++;state.heat=1;
            if(state.roastIndex>=3){state.step=2;state.roastIndex=2;}
            render();
          });
          return;
        }

        if(state.step===2){
          const sauceLabel=sauces.find(x=>x[0]===state.sauce)?.[1];
          const toppingLabel=toppings.find(x=>x[0]===state.garnish)?.[1];
          if(sauceLabel&&toppingLabel){const plate=el('div','mka-finish-note');plate.append(el('b','',`${sauceLabel} · ${toppingLabel}`),el('span','','火候恰好，香气正好落在这一签里。'));stage.append(plate);}
          say('三颗都烤好了。选一道蘸料，再添一笔点缀，做成自己的配方。');
          sauces.forEach(([key,label])=>choice(label,()=>{state.sauce=key;render();},state.sauce===key));
          toppings.forEach(([key,label])=>choice(`点缀：${label}`,()=>{state.garnish=key;render();},state.garnish===key));
          const done=button('盖印收好这一签',()=>{state.step=3;const detail=`按${state.selected.map(i=>palette[i][0]).join('、')}的顺序串成三颗团子，逐颗观察火候烤出金边，再配上${sauceLabel}与${toppingLabel}。`;render();finish(detail);});
          done.disabled=!state.sauce||!state.garnish;
          return;
        }

        const sauceLabel=sauces.find(x=>x[0]===state.sauce)?.[1]||'';
        const toppingLabel=toppings.find(x=>x[0]===state.garnish)?.[1]||'';
        const seal=el('div','mka-dango-seal');seal.append(icon('seal'),el('span','',`春日手作 · ${sauceLabel}`),el('b','',toppingLabel));stage.append(seal);
        say('这张配方已经盖印收好。散策手帖会记下你的搭配。');
      },
      R04(){
        const papers=[['樱色','#edb6bf'],['竹青','#9bb8aa'],['月白','#eee5cd']];
        const boats=[['flat','宽底稳航'],['swift','尖首快行'],['charm','双纸饰船']];
        if(state.step===0){scenery('stream','R04');sceneCaption('纸色与船形会留下不同的旅程。');const paper=el('div',`mka-paper ${state.boat?'mka-fold-'+state.boat:''}`);paper.style.background=papers[state.paper??0][1];paper.append(icon('boat'));stage.append(paper);papers.forEach(([name],i)=>choice(name,()=>{state.paper=i;render();},(state.paper??0)===i));boats.forEach(([key,label])=>choice(label,()=>{state.boat=key;render();},state.boat===key));button('选好纸与船形',()=>{state.step=1;render();});say('先挑纸色和船形；之后每次都能根据水面的提示慢慢选路。');}
        else if(state.step<4){scenery('stream','R04');sceneCaption(['','对齐纸角，留下一条折痕。','收好两边，让船身站起来。','轻轻展开，让纸舟鼓起。'][state.step]);const paper=el('div',`mka-paper mka-fold-${state.step}`);paper.style.background=papers[state.paper||0][1];paper.append(icon(state.step===3?'boat':'ticket'));stage.append(paper);say(`折纸 · ${state.step-1}/3`);button(['','对折纸角','折起两边','展开船身'][state.step],()=>{state.step++;render();});}
        else{
          scenery('stream','R04');sceneCaption('按住纸舟，拖过下一道水门；也可以用下方按钮选路。');
          const courses={flat:{routes:['left','right','center'],hints:['右侧石头密，左边水面更宽。','左边水流急，右侧水面平稳。','两岸石头靠拢，中间留有一条窄水道。']},swift:{routes:['center','left','right'],hints:['水草向两边分开，中间水流最快。','右岸石头凸出，左侧能顺势绕开。','左边水花回旋，右侧水道更直。']},charm:{routes:['right','center','left'],hints:['左岸有浅滩，右侧水线连贯。','石头向右侧聚拢，中间留出空隙。','右岸水花回旋，左侧能平稳靠岸。']}};
          const course=courses[state.boat||'flat'];
          if(state.count>=3){say('纸舟越过三处石头，顺着清溪漂远了。');return;}
          const lanes={left:116,center:360,right:604},gates=[126,232,338];
          state.riverPath=state.riverPath||[];
          const board=el('canvas','mka-river-canvas');board.width=720;board.height=420;board.setAttribute('role','application');board.setAttribute('aria-label',`纸舟河道，第 ${state.count+1} 道水门，共三道。按住小舟拖过正确水道，或使用下方方向按钮。`);board.tabIndex=0;stage.append(board);
          let attempt=[];let dragging=false;
          const draw=()=>{
            const ctx=board.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,720,420);
            ctx.save();ctx.beginPath();ctx.moveTo(78,0);ctx.bezierCurveTo(155,110,92,290,156,420);ctx.lineTo(564,420);ctx.bezierCurveTo(625,275,556,125,642,0);ctx.closePath();ctx.fillStyle='#d9ebe0b8';ctx.fill();
            ctx.strokeStyle='#f8fff0a8';ctx.lineWidth=4;for(let i=0;i<7;i++){const x=152+i*68;ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+36,110,x-29,270,x+8,420);ctx.stroke();}ctx.restore();
            const laneX=direction=>lanes[direction];
            state.riverPath.forEach((direction,i)=>{const x=laneX(direction),y=gates[i];ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fillStyle='#8ba995';ctx.fill();ctx.strokeStyle='#f8f4df';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✓',x,y);});
            for(let i=state.count;i<3;i++){
              const open=laneX(course.routes[i]);const y=gates[i];
              ctx.setLineDash([7,7]);ctx.strokeStyle='#f7fff0a0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(56,y);ctx.lineTo(664,y);ctx.stroke();ctx.setLineDash([]);
              ctx.fillStyle='#344c3fe8';ctx.font='bold 22px sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(`水门 ${i+1}`,72,y);
              for(const x of Object.values(lanes))if(x!==open){ctx.fillStyle='#71847b';ctx.beginPath();ctx.ellipse(x,y,39,17,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff35';ctx.beginPath();ctx.ellipse(x-10,y-5,13,4,-.2,0,Math.PI*2);ctx.fill();}
              ctx.fillStyle='#617e69';ctx.beginPath();ctx.arc(open,y,25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f9f4df';ctx.lineWidth=2;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);
            }
            const boatX=state.count?laneX(state.riverPath[state.count-1]):360;const boatY=state.count?gates[state.count-1]+36:43;
            const path=attempt;
            if(path.length){ctx.beginPath();ctx.moveTo(boatX,boatY);for(const p of path)ctx.lineTo(p.x,p.y);ctx.strokeStyle='#fff7d9';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.strokeStyle='#719782';ctx.lineWidth=2;ctx.stroke();}
            const current=attempt.length?attempt[attempt.length-1]:{x:boatX,y:boatY};
            ctx.save();ctx.translate(current.x,current.y);ctx.rotate(-.08);ctx.shadowColor='#2b423855';ctx.shadowBlur=9;ctx.shadowOffsetY=4;
            ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(-22,17);ctx.lineTo(23,17);ctx.lineTo(35,0);ctx.closePath();ctx.fillStyle=papers[state.paper||0][1];ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#536f69';ctx.stroke();ctx.shadowColor='transparent';ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(0,0);ctx.moveTo(-13,0);ctx.lineTo(0,-21);ctx.lineTo(14,0);ctx.stroke();ctx.restore();
            ctx.fillStyle='#344b40';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(`水门 ${state.count+1} / 3`,360,405);
          };
          const point=event=>{const rect=board.getBoundingClientRect();return{x:(event.clientX-rect.left)*720/rect.width,y:(event.clientY-rect.top)*420/rect.height};};
          const currentBoat=()=>({x:state.count?lanes[state.riverPath[state.count-1]]:360,y:state.count?gates[state.count-1]+36:43});
          const fail=()=>{attempt=[];draw();say(`小舟在水门边打了个转。${course.hints[state.count]}再拖一次，或用方向按钮。`);};
          const steer=direction=>{if(direction!==course.routes[state.count]){fail();return;}state.route=direction;state.riverPath.push(direction);state.count++;render();if(state.count===3)finish(`${boats.find(x=>x[0]===state.boat)?.[1]||'纸舟'}沿着清溪越过三处石头，最后从${papers[state.paper||0][0]}纸面上泛起一圈微光。`);};
          board.addEventListener('pointerdown',event=>{const p=point(event),boat=currentBoat();if(Math.hypot(p.x-boat.x,p.y-boat.y)>54)return;dragging=true;attempt=[p];board.setPointerCapture(event.pointerId);board.focus({preventScroll:true});say(`水道 · ${state.count+1}/3。${course.hints[state.count]}把纸舟拖过虚线水门。`);draw();});
          board.addEventListener('pointermove',event=>{if(!dragging)return;const p=point(event);if(Math.hypot(p.x-attempt[attempt.length-1].x,p.y-attempt[attempt.length-1].y)>2)attempt.push(p);draw();});
          board.addEventListener('pointerup',event=>{if(!dragging)return;dragging=false;const p=point(event);if(Math.hypot(p.x-attempt[attempt.length-1].x,p.y-attempt[attempt.length-1].y)>2)attempt.push(p);const gateY=gates[state.count];let crossing=null;for(let i=1;i<attempt.length;i++){const a=attempt[i-1],b=attempt[i];if(a.y<=gateY&&b.y>=gateY){const t=(gateY-a.y)/(b.y-a.y||1);crossing={x:a.x+(b.x-a.x)*t,y:gateY};break;}}if(!crossing||p.y<gateY+22){fail();return;}const lane=Object.entries(lanes).sort((a,b)=>Math.abs(a[1]-crossing.x)-Math.abs(b[1]-crossing.x))[0];if(Math.abs(lane[1]-crossing.x)>76){fail();return;}steer(lane[0]);});
          board.addEventListener('pointercancel',()=>{if(dragging){dragging=false;fail();}});
          draw();say(`水道 · ${state.count+1}/3。${course.hints[state.count]}拖动纸舟穿过正确水门，或者使用方向按钮。`);
          [['left','向左引导'],['center','顺着中间'],['right','向右引导']].forEach(([direction,label])=>button(label,()=>steer(direction)));
        }
      },
      R05(){
        scenery('platform','R05');sceneCaption('从站前出发，按顺序串起沿途的三站小旅行。');
        const destinations={山侧:['hill','展望坡'],临海:['coast','海边站台'],旧街:['old','旧街口']};
        const stops=[['old','旧街口','巷口的木牌被风吹响'],['hill','展望坡','远山在夕光里连成一线'],['market','小店街','橱窗里刚摆好一篮春日点心'],['coast','海边站台','潮声刚好盖过车铃']];
        const patterns=[['leaf','叶影'],['seal','花结'],['tram','电车'],['firefly','海鸥']];
        state.route ||= [];state.stamps ||= [];
        const destination=destinations[state.direction];
        const route=state.direction?[...state.route,destination[0]]:state.route;
        const ticket=el('div',`mka-ticket${state.step===2?' mka-ticket-ready':''}`);
        ticket.append(el('span','mka-ticket-label',`MIKAGE · ${state.step===2?'旅程已盖印':'站前旅票'}`),el('strong','',`往 ${destination?.[1]||'选择方向'}`),el('small','mka-ticket-stop',`${state.theme||'先选一段路，再慢慢出发'}`));
        const track=el('div','mka-route-track');
        const routeLabels=['站前',...route.map(key=>stops.find(x=>x[0]===key)?.[1]||key)];
        routeLabels.forEach((label,i)=>{const node=el('span',`mka-route-stop${i>0&&i<=state.route.length?' is-planned':''}${i===routeLabels.length-1&&state.step>0?' is-destination':''}`);node.append(el('i','',i===0?'出':String(i)),el('b','',label));track.append(node);});
        if(state.step===0&&state.route.length<2){const placeholder=el('span','mka-route-stop is-next');placeholder.append(el('i','','·'),el('b','','待安排'));track.append(placeholder);}
        ticket.append(track);
        const stamps=el('div','mka-ticket-stamps');for(let i=0;i<3;i++){const cell=el('span',`mka-stamp-slot${i===state.stamps.length&&state.step===1?' is-active':''}`);cell.append(el('small','',route[i+1]?stops.find(x=>x[0]===route[i+1])?.[1]||'终点':'终点'));if(state.stamps[i]!==undefined)cell.append(icon(patterns[state.stamps[i]][0]));else cell.append(el('b','','+'));stamps.append(cell);}ticket.append(stamps);stage.append(ticket);
        if(state.step===0){
          ['山侧','临海','旧街'].forEach(v=>choice(`往${v}`,()=>{if(state.direction!==v){state.direction=v;state.route=[];state.stamps=[];}render();},state.direction===v));
          ['慢慢散步','沿途拍照','尝一份点心'].forEach(v=>choice(v,()=>{state.theme=v;render();},state.theme===v));
          say(state.direction?`行程 · ${state.route.length}/2 处中途站。选站的先后会保留在旅票上。`:'先选目的方向与行程心情，再安排两处中途站。');
          if(destination){
            const choices=stops.filter(x=>x[0]!==destination[0]&&!state.route.includes(x[0]));
            choices.forEach(([key,label])=>button(`加入第${state.route.length+1}站：${label}`,()=>{if(state.route.length<2)state.route.push(key);render();},'mka-route-choice'));
            const undo=button('撤回上一站',()=>{state.route.pop();render();},'mka-quiet');undo.disabled=!state.route.length;
            if(state.route.length===2)button('检票出发',()=>{state.step=1;render();});
          }
          return;
        }
        if(state.step===1){
          const index=state.stamps.length,current=route[index+1],stop=stops.find(x=>x[0]===current);const eventText=stop?.[2]||'窗外的景色一段段慢下来。';
          say(`第 ${index+1}/3 站 · ${stop?.[1]||'沿途一站'}。${eventText}为这一站盖一枚印。`);
          patterns.forEach(([_,label],i)=>button(`盖一枚${label}`,()=>{state.stamps.push(i);if(state.stamps.length===3)state.step=2;render();},'mka-stamp-choice'));
          return;
        }
        const stampNames=state.stamps.map(i=>patterns[i]?.[1]||'旅途印');
        say('三站路线排好了。看一眼每站的印记，喜欢的话就收进手帖。');
        button('收好这张旅票',()=>finish(`以「${state.theme||'慢慢散步'}」为心情，从站前往${destination?.[1]||'远方'}；按${route.map(key=>stops.find(x=>x[0]===key)?.[1]).join(' → ')}的顺序停靠，依次盖下${stampNames.join('、')}。`));
      },
      R06(){
        const periodLabel={day:'清晨',dusk:'黄昏',night:'夜色'}[opts.period]||'黄昏';
        scenery('coast-platform','R06');sceneCaption(`${periodLabel}的站台有海风，也有远处的灯塔。`);
        const frames=[['gold','暖金卡纸'],['blue','海蓝胶片'],['bell','风铃边框']];
        const views=[['lighthouse','灯塔与海'],['tram','电车入站'],['firefly','海鸥掠过']];
        const card=el('div',`mka-postcard ${state.frame?'mka-frame-'+state.frame:''} ${state.view?'mka-view-'+state.view:''}`);
        card.append(el('span','mka-ticket-label',`海风邮便 · ${periodLabel}留影`));
        const photo=el('div',`mka-photo-view ${state.view?'mka-view-'+state.view:''}`);const photoUrl=assetUrl('R06');if(photoUrl)photo.style.backgroundImage=`linear-gradient(180deg,#10243112,#18333a35),url(${JSON.stringify(photoUrl)})`;photo.append(icon(state.view==='tram'?'tram':state.view==='firefly'?'firefly':'lighthouse'),el('span','',views.find(x=>x[0]===state.view)?.[1]||'等风入镜'));card.append(photo);
        const collage=el('div','mka-collage');for(let i=0;i<2;i++){const cell=el('div','mka-collage-slot');if(state.selected[i]!==undefined){const mark=[['seal','山影'],['tram','站台'],['firefly','海鸥']][state.selected[i]];cell.append(icon(mark[0]),el('span','',mark[1]));}else cell.append(el('span','',`邮戳 ${i+1}`));collage.append(cell);}card.append(collage,el('p','mka-card-note',state.note||'把今天的海风寄给你。'));stage.append(card);
        if(!state.step){
          frames.forEach(([key,label])=>choice(label,()=>{state.frame=key;render();},(state.frame||'gold')===key));
          views.forEach(([key,label])=>choice(label,()=>{state.view=key;render();},(state.view||'lighthouse')===key));
          button('选好构图，开始留影',()=>{state.step=1;render();});say('选择相框与取景主题。只在候车区域拍照，轨道与海岸都不会成为可走区域。');
        }else{
          [['seal','山影'],['tram','站台'],['firefly','海鸥']].forEach(([_,label],i)=>{const b=button(`盖下${label}邮戳`,()=>{state.selected.push(i);render();});b.disabled=state.selected.includes(i)||state.selected.length>=2||completed;});
          if(state.selected.length<2){say(`相框已选好，邮戳 · ${state.selected.length}/2。挑两枚装饰明信片。`);}
          else{say('明信片已经成形，再选一句寄语。');['把今天的海风寄给你。','等风，也等下一班电车。','愿每一次相逢都有回声。'].forEach(note=>{const b=choice(note,()=>{state.note=note;render();},(state.note||'把今天的海风寄给你。')===note);b.disabled=completed;});const b=button('收好这张明信片',()=>finish(`${periodLabel}在临海站台，以「${views.find(x=>x[0]===state.view)?.[1]||'灯塔与海'}」为主题，用${frames.find(x=>x[0]===state.frame)?.[1]||'暖金卡纸'}留影，盖下${state.selected.map(i=>[['山影'],['站台'],['海鸥']][i][0]).join('、')}邮戳。寄语：${state.note||'把今天的海风寄给你。'}`));b.disabled=completed;}
        }
      },
      R07(){
        const species=[['ginkgo','银杏','mka-ginkgo'],['fern','蕨叶','mka-fern'],['camellia','椿叶','mka-camellia']];
        scenery('grove','R07');sceneCaption('循着林间线索找到叶片，再亲手把纹路压进纸里。');
        if(state.step===0){
          if(!state.clue){say('先选一个观察方向，再沿着线索找叶子。');[['foot','循着细小脚印'],['bark','看树皮的纹路'],['leaf','观察叶片落点']].forEach(([key,label])=>choice(label,()=>{state.clue=key;render();},state.clue===key));return;}
          const grove=el('div','mka-grove');species.forEach(([name,label,cls],i)=>{const b=button(`寻找${label}`,()=>{if(!state.selected.includes(i))state.selected.push(i);render();},`mka-found-leaf ${cls} ${state.selected.includes(i)?'mka-found':''}`,grove);b.replaceChildren(icon(name),el('span','',state.selected.includes(i)?`${label} · 已找到`:label));b.disabled=state.selected.includes(i);});stage.append(grove);
          say(`${{foot:'脚印指向湿润的溪边，',bark:'树皮的纹路绕过低枝，',leaf:'落叶在背风处聚成小堆，'}[state.clue]}找到 ${state.selected.length}/3 种叶片。`);if(state.selected.length===3)button('铺开拓纸',()=>{state.step=1;state.rubPaths=[];render();});
          return;
        }
        if(state.step===1){
          state.rubPaths ||= [];
          const paper=el('div',`mka-rubbing ${state.ink||''}`),canvas=el('canvas','mka-rubbing-canvas');canvas.width=640;canvas.height=320;canvas.setAttribute('role','application');canvas.setAttribute('aria-label','草木拓纸。选好拓色后，用手指或鼠标在纸面上来回涂抹；也可以按压印一笔。');canvas.tabIndex=0;paper.append(canvas);stage.append(paper);
          const inkColors={moss:'#657f56',rose:'#b87183',ochre:'#9c8245'};
          const draw=paths=>{const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,640,320);ctx.fillStyle='#f8f0dc';ctx.fillRect(0,0,640,320);ctx.strokeStyle='#d3c4a4';ctx.lineWidth=2;ctx.strokeRect(9,9,622,302);
            const progress=Math.min(paths.length,6)/6,ink=inkColors[state.ink]||'#8b9c7c',imprintAlpha=.24+progress*.55;
            const leaf=(x,y,type,angle)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=imprintAlpha;ctx.fillStyle=ink;ctx.strokeStyle=ink;ctx.lineWidth=2.2;ctx.lineCap='round';ctx.lineJoin='round';
              if(type==='ginkgo'){
                ctx.beginPath();ctx.moveTo(0,72);ctx.quadraticCurveTo(-7,48,-5,27);ctx.quadraticCurveTo(-28,21,-48,13);ctx.quadraticCurveTo(-58,6,-48,-2);ctx.quadraticCurveTo(-54,-13,-39,-18);ctx.quadraticCurveTo(-39,-33,-24,-37);ctx.quadraticCurveTo(-18,-54,-5,-48);ctx.quadraticCurveTo(0,-62,7,-48);ctx.quadraticCurveTo(21,-54,26,-37);ctx.quadraticCurveTo(42,-32,40,-17);ctx.quadraticCurveTo(55,-12,48,-1);ctx.quadraticCurveTo(59,8,47,15);ctx.quadraticCurveTo(25,23,5,28);ctx.quadraticCurveTo(7,51,0,72);ctx.closePath();ctx.fill();ctx.stroke();
                ctx.beginPath();ctx.moveTo(0,69);ctx.lineTo(0,20);for(let j=0;j<7;j++){const a=-2.65+j*.44;ctx.moveTo(0,23);ctx.lineTo(Math.cos(a)*48,Math.sin(a)*43-3);}ctx.stroke();
              }else if(type==='fern'){
                ctx.beginPath();ctx.moveTo(0,70);ctx.lineTo(0,-67);ctx.stroke();for(let j=0;j<7;j++){const yy=48-j*17,length=31-j*2.1;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(0,yy);ctx.quadraticCurveTo(side*length*.43,yy-4,side*length,yy-19);ctx.quadraticCurveTo(side*length*.55,yy-12,0,yy);ctx.closePath();ctx.fill();ctx.stroke();}}
              }else{
                ctx.beginPath();ctx.moveTo(0,68);ctx.quadraticCurveTo(-19,27,-38,-34);ctx.quadraticCurveTo(-42,-52,-28,-56);ctx.quadraticCurveTo(-9,-58,0,-68);ctx.quadraticCurveTo(9,-58,28,-56);ctx.quadraticCurveTo(42,-52,38,-34);ctx.quadraticCurveTo(19,27,0,68);ctx.closePath();ctx.fill();ctx.stroke();
                ctx.beginPath();ctx.moveTo(0,64);ctx.lineTo(0,-62);for(let j=1;j<=7;j++){const yy=58-j*15;ctx.moveTo(0,yy);ctx.quadraticCurveTo(-16,yy-3,-29,yy-16);ctx.moveTo(0,yy);ctx.quadraticCurveTo(16,yy-3,29,yy-16);}ctx.stroke();
              }
              ctx.restore();};
            leaf(135,166,'ginkgo',-.36);leaf(320,164,'fern',.04);leaf(505,166,'camellia',.42);ctx.globalAlpha=1;
            ctx.save();ctx.globalCompositeOperation='multiply';ctx.strokeStyle=ink;ctx.lineCap='round';ctx.lineJoin='round';paths.forEach((path,index)=>{if(!path?.length)return;ctx.beginPath();ctx.moveTo(path[0].x*640,path[0].y*320);for(let i=1;i<path.length;i++)ctx.lineTo(path[i].x*640,path[i].y*320);ctx.globalAlpha=.045+index*.006;ctx.lineWidth=5;ctx.stroke();ctx.globalAlpha=.1+index*.01;ctx.lineWidth=1.2;ctx.stroke();});ctx.restore();};
          draw(state.rubPaths);
          const point=event=>{const rect=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))};};
          let drawing=null;
          canvas.addEventListener('pointerdown',event=>{if(!state.ink){say('先选一层拓色，再压印叶脉。');return;}drawing=[point(event)];canvas.setPointerCapture(event.pointerId);canvas.focus({preventScroll:true});});
          canvas.addEventListener('pointermove',event=>{if(!drawing)return;const next=point(event);if(Math.hypot(next.x-drawing[drawing.length-1].x,next.y-drawing[drawing.length-1].y)>.008)drawing.push(next);draw([...state.rubPaths,drawing]);});
          canvas.addEventListener('pointerup',()=>{if(!drawing)return;if(drawing.length>1){state.rubPaths.push(drawing);render();}drawing=null;});
          canvas.addEventListener('pointercancel',()=>{drawing=null;draw(state.rubPaths);});
          say(`选择拓色，再在纸上来回压印 · ${state.rubPaths.length}/6 笔。来回几次，叶脉会逐渐显出来。`);
          [['moss','苔绿'],['rose','樱粉'],['ochre','赭金']].forEach(([value,label])=>{const b=choice(label,()=>{state.ink=value;render();},state.ink===value);b.disabled=completed;});
          const tap=button('压印一笔',()=>{if(!state.ink)return;const n=state.rubPaths.length,y=.18+(n%6)*.12;state.rubPaths.push(Array.from({length:8},(_,i)=>({x:.12+i*.11,y:y+Math.sin(i*.7+n)*.025})));render();},'mka-quiet');tap.disabled=!state.ink||state.rubPaths.length>=6||completed;
          if(state.rubPaths.length>=6)button('收好这一页叶拓',()=>{state.step=2;const detail=`循着${{foot:'脚印',bark:'树皮纹路',leaf:'落叶方向'}[state.clue]}找到银杏、蕨叶和椿叶，在拓纸上来回压印${state.rubPaths.length}笔，显出一页${{moss:'苔绿',rose:'樱粉',ochre:'赭金'}[state.ink]}草木纹样。`;render();finish(detail);});
          return;
        }
        const done=el('div','mka-rubbing-done');done.append(icon('seal'),el('b','','草木纹样已拓好'));stage.append(done);say('这一页叶拓已经收进散策手帖。');
      },
      R08(){
        scenery('night','R08');sceneCaption('微光不催促你。忘记顺序了，随时可以再看一遍。');
        const sequences={reeds:[[0,2,1,0],[0,2,1,0,2,3]],water:[[3,1,2,0],[3,1,2,0,1,3]]};state.round ??= 0;
        if(!state.mode){say('选择一处观察线索，萤火会用不同的节奏回应。');[['reeds','听芦苇'],['water','看水纹']].forEach(([key,label])=>choice(label,()=>{state.mode=key;state.round=0;state.order=sequences[key][0];state.input=0;render();flash();},state.mode===key));}
        const group=el('div','mka-fireflies');
        const fireflyCount=4;
        const accept=i=>{
          if(state.busy||completed||!state.mode)return;
          if(i!==state.order[state.input]){state.input=0;render();say('微光还在。可以重看这段顺序，再从第一簇慢慢跟上。');return;}
          state.input++;
          if(state.input>=state.order.length){
            if(state.round===0){state.round=1;state.order=sequences[state.mode][1];state.input=0;render();say('第一段跟上了。稍长的一段微光正在回应你……');flash();return;}
            state.step=2;const detail=`你选择${state.mode==='reeds'?'听芦苇里的风':'看水面的波纹'}，跟上两段由${state.order.length}簇微光组成的次序，在夜色里留下了一次安静的回应。`;render();finish(detail);return;
          }
          render();
        };
        for(let i=0;i<fireflyCount;i++){
          const b=button(`第${i+1}簇萤火`,()=>accept(i),`mka-firefly${state.mode?' mka-awake':''}`,group);b.dataset.fly=String(i);b.replaceChildren(el('i','mka-firefly-sprite'),el('span','',`${i+1}`));b.disabled=!state.mode||!!state.busy||completed||state.step===2;
        }
        stage.append(group);
        if(state.mode&&state.step!==2){const round=state.round||0;say(state.busy?'看看微光闪亮的顺序……':`第 ${round+1}/2 段 · 跟随微光 ${state.input||0}/${state.order?.length||4}。不计时，也不会失去已完成的第一段。`);
          const hint=button('重看当前光序',flash);hint.disabled=!!state.busy||completed;button('显示数字提示',()=>say(`这一段的光序是：${state.order.map(i=>i+1).join(' → ')}。`),'mka-quiet');}
        else if(state.step===2)say('两段微光都跟上了。今晚的路线已经记在心里。');
        function flash(){
          if(state.busy||disposed||completed||!state.mode)return;state.input=0;
          if(opts.reducedMotion){say(`第${(state.round||0)+1}段光序：${state.order.map(i=>i+1).join(' → ')}。按顺序轻点即可。`);return;}
          state.busy=true;const gen=generation;render();
          state.order.forEach((i,j)=>{
            later(()=>{if(gen!==generation)return;stage.querySelector(`[data-fly="${i}"]`)?.classList.add('mka-glow');},j*850+150);
            later(()=>{if(gen!==generation)return;stage.querySelector(`[data-fly="${i}"]`)?.classList.remove('mka-glow');},j*850+700);
          });
          later(()=>{if(gen!==generation)return;state.busy=false;render();},state.order.length*850+900);
        }
      },
      R09(){
        const patterns=state.tempo==='lively'?[['咔','咚','咔','咚'],['咚','咔','咔','咚'],['咔','咔','咚','咔']]:[['咚','咚','咔','咚'],['咔','咚','咔','咚'],['咚','咔','咚','咔']];
        scenery('kagura','R09');sceneCaption('先看完这一句节奏，再敲鼓心「咚」和鼓沿「咔」。');
        if(!state.tempo&&!state.free){say('先选今晚的合奏气氛。节拍图样会跟着变化。');choice('稳稳跟拍',()=>{state.tempo='steady';render();});choice('轻快合拍',()=>{state.tempo='lively';render();});}
        const drum=el('div','mka-drum'),canvas=el('canvas','mka-drum-canvas');canvas.width=360;canvas.height=210;canvas.setAttribute('aria-hidden','true');drum.append(canvas);stage.append(drum);
        const ctx=canvas.getContext('2d');if(ctx){const wood=ctx.createLinearGradient(54,44,306,174);wood.addColorStop(0,'#6a302b');wood.addColorStop(.48,'#aa5745');wood.addColorStop(1,'#572a28');ctx.fillStyle=wood;ctx.beginPath();ctx.ellipse(180,54,112,40,0,0,Math.PI*2);ctx.fill();ctx.fillRect(68,54,224,90);ctx.beginPath();ctx.ellipse(180,144,112,40,0,0,Math.PI);ctx.fill();ctx.strokeStyle='#efc78d';ctx.lineWidth=7;for(let i=0;i<7;i++){const x=84+i*32;ctx.beginPath();ctx.moveTo(x,57);ctx.lineTo(x+(i%2?24:-24),140);ctx.stroke();}ctx.beginPath();ctx.ellipse(180,54,112,40,0,0,Math.PI*2);ctx.fillStyle='#f0d9ad';ctx.fill();ctx.strokeStyle='#75473b';ctx.lineWidth=5;ctx.stroke();ctx.beginPath();ctx.ellipse(180,54,97,31,0,0,Math.PI*2);ctx.strokeStyle='#fff0d0';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ead9bb';ctx.beginPath();ctx.ellipse(180,54,89,25,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#bb9870';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(180,54,65,17,0,0,Math.PI*2);ctx.stroke();}
        const pattern=patterns[Math.min(state.count,2)];const beats=el('div','mka-beats');pattern.forEach((beat,i)=>beats.append(el('span',`mka-beat ${i<(state.input||0)?'mka-beat-done':''} ${i===(state.input||0)?'mka-beat-next':''}`,beat)));stage.append(beats);
        say(state.free?'自由敲击中，不计对错。切回练习可继续。':`第 ${Math.min(state.count+1,3)}/3 句 · 已跟上 ${state.input||0}/4 拍。`);
        ['咚','咔'].forEach(beat=>{const b=button(beat==='咚'?'咚 · 鼓心':'咔 · 鼓沿',()=>{
          tone(beat);drum.classList.remove('mka-hit');void drum.offsetWidth;drum.classList.add('mka-hit');
          if(state.free){say(`你敲了一声「${beat}」，鼓声轻轻荡开。`);return;}if(completed||!state.tempo)return;
          if(beat!==pattern[state.input||0]){state.input=0;say('差一点点。照着图样，从第一拍重新试试。');beats.querySelectorAll('.mka-beat').forEach((n,i)=>{n.classList.remove('mka-beat-done');n.classList.toggle('mka-beat-next',i===0);});return;}
          state.input=(state.input||0)+1;if(state.input===4){state.count++;state.input=0;if(state.count===3){state.step=1;render();finish(`你选了${state.tempo==='lively'?'轻快合拍':'稳稳跟拍'}，跟着三句各四拍的节奏完成了今晚的太鼓练习。`);return;}}render();
        },'mka-drum-button');b.disabled=(completed&&!state.free)||(!state.tempo&&!state.free);});
        button(state.free?'回到三拍练习':'自由敲一会儿',()=>{state.free=!state.free;render();},'mka-quiet');
        const soundButton=button(sound?'声音已开启 · 点击静音':'声音关闭 · 点击开启',async()=>{if(sound){sound=false;render();return;}try{const Audio=global.AudioContext||global.webkitAudioContext;if(!Audio){say('当前环境不支持声音，仍然可以看图样练习。');return;}audio ||= new Audio();await audio.resume();if(disposed)return;sound=true;render();}catch(_){say('声音暂时无法开启，仍然可以看图样练习。');}},'mka-quiet');soundButton.setAttribute('aria-pressed',String(sound));
        function tone(beat){if(!sound||!audio)return;try{const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;osc.type='sine';osc.frequency.setValueAtTime(beat==='咚'?160:420,t);osc.frequency.exponentialRampToValueAtTime(beat==='咚'?65:210,t+.15);gain.gain.setValueAtTime(.13,t);gain.gain.exponentialRampToValueAtTime(.001,t+.2);osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.22);}catch(_){sound=false;}}
      },
      R10(){
        const colors=[['warm','暖金'],['sakura','樱粉'],['jade','青灯']];state.color ||= 'warm';
        scenery('night-path','R10');sceneCaption('先排一条灯路，再逐盏点亮。保存前还能反复改色。');
        const layouts=[['path','参道弧线'],['row','并肩灯列'],['arc','回游灯环']];const row=el('div',`mka-lanterns mka-layout-${state.layout||'path'}`);for(let i=0;i<6;i++){const lit=state.selected[i];const b=button(`第${i+1}盏灯${lit?'，已点亮，可换色':'，尚未点亮'}`,()=>{if(completed)return;state.selected[i]=state.color;render();},`mka-lantern ${lit?'mka-lantern-lit mka-'+lit:''}`,row);b.replaceChildren(el('i','mka-lantern-sprite'),el('span','',String(i+1)));b.disabled=completed;}stage.append(row);
        layouts.forEach(([key,label])=>{const b=choice(label,()=>{if(completed)return;state.layout=key;render();},(state.layout||'path')===key);b.disabled=completed;});
        colors.forEach(([key,label])=>{const b=choice(label,()=>{if(completed)return;state.color=key;render();},state.color===key);b.disabled=completed;});
        const litCount=state.selected.filter(Boolean).length;
        say(completed?'灯路与灯色已经收进这一幕。再玩一次，可以重新安排夜路。':`先排成${layouts.find(x=>x[0]===(state.layout||'path'))[1]}，再选颜色点灯 · ${litCount}/6。点亮后也可以换色。`);
        if(litCount===6){const save=button('收好这一幕',()=>{finish(`按${layouts.find(x=>x[0]===(state.layout||'path'))[1]}排好六盏纸灯：${colors.map(([key,label])=>`${label}${state.selected.filter(c=>c===key).length}盏`).join('、')}。`);render();});save.disabled=completed;}
      },
    };
    reset();
    return {dispose(){if(disposed)return;disposed=true;generation++;cancelTimers();if(audio){try{const closing=audio.close();closing?.catch?.(()=>{});}catch(_){}audio=null;}root.remove();}};
  }
  return {mount};
}

const SCENES = {
  R01: { place:'御影神社', title:'庭前拾叶', note:'先听风，再把庭上的叶片收进竹篮。最后决定要留下哪一片秋色。', tags:['风向会改变这一幕','可以自己决定庭院的样子'] },
  R02: { place:'坂道住宅区', title:'与猫慢慢熟悉', note:'看看耳朵和尾巴的变化，再选择合适的距离。它会按自己的节奏回应，不必连续点击。', tags:['观察动作再做选择','没有倒计时'] },
  R03: { place:'团子小店', title:'串起一签春色', note:'按顺序挑三颗团子，逐颗观察火候并调节火力，最后选择蘸料和点缀。没有倒计时，火候不合适可以重来。', tags:['三阶段手作流程','观察与调火','预绘团子小店场景'] },
  R04: { place:'清溪石桥', title:'让纸舟顺水走', note:'折好纸舟后拖动它穿过三道水门，船形决定可通行的水道。走错能重新尝试，也可以用按钮选路。', tags:['三道河道闯关','拖动或按钮操作','无需赶时间'] },
  R05: { place:'临海车站', title:'等车时的一枚票根', note:'从站前出发，按顺序安排两处停靠与终点，再逐站盖上纪念印。可以回退重排路线。', tags:['三站路线规划','停靠顺序会改变票根','预绘车站场景'] },
  R06: { place:'海边电车站', title:'海风寄来的明信片', note:'选取景主题，等电车进站后再挑相框、邮戳和寄语，做成一张海边明信片。', tags:['站台取景与装帧','预绘海滨场景'] },
  R07: { place:'林间木道', title:'收集一页叶拓', note:'沿着脚印、树皮或落叶找到三种叶片，再用手指在拓纸上来回压出叶脉。', tags:['线索影响观察方向','手指涂抹与按钮辅助','预绘林间场景'] },
  R08: { place:'芦苇栈道', title:'跟着微光呼吸', note:'选择听芦苇还是看水面，记住两段逐渐变长的萤火顺序；可以随时重看。', tags:['两段记忆挑战','可重看光序','预绘夜间湿地'] },
  R09: { place:'神乐会所', title:'神乐前的三拍练习', note:'选择稳拍或轻快合拍，跟着三段逐渐变化的四拍节奏敲鼓；也可以自由合奏。', tags:['三段四拍练习','鼓面动态反馈','预绘神乐会所'] },
  R10: { place:'灯火参道', title:'把归途慢慢点亮', note:'先选一条灯路，再逐盏安排颜色点亮。六盏灯都能在保存前重新调整。', tags:['三种参道布局','六盏灯自由配色','预绘黄昏参道'] },
};

function artUrl(key, period) {
  const entry = ART[key];
  const url = typeof entry === 'string' ? entry : entry?.[period] || entry?.day || entry?.default;
  return typeof url === 'string' && /^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(url) ? url : null;
}

export function start() {
  const host = window;
  const existing = host.MikageMinigames;
  if (existing?.version === version && typeof existing.open === 'function') return existing;
  existing?.dispose?.();
  const mountActivity = createMikageActivities(host).mount;
  let current = null;

  function open(options = {}) {
    const region = String(options.region || 'R01');
    const scene = SCENES[region];
    if (!scene) throw new RangeError(`未知散策地区：${region}`);
    const doc = host.document;
    if (!doc?.body) return null;
    current?.close({ notify:false });
    const mount = doc.createElement('div');
    mount.dataset.mikageMinigameHost = '';
    mount.style.cssText = 'position:fixed;inset:0;z-index:2147483600;';
    const shadow = mount.attachShadow({ mode:'open' });
    const style = doc.createElement('style');
    style.textContent = GAME_CSS;
    shadow.append(style);
    const overlay = doc.createElement('div');
    overlay.className = 'mkg-overlay';
    const dialog = doc.createElement('section');
    dialog.className = 'mkg-dialog';
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-labelledby','mkg-dialog-title');
    dialog.tabIndex = -1;
    const bar = doc.createElement('header');
    bar.className = 'mkg-topbar';
    const brand = doc.createElement('div');
    brand.className = 'mkg-brand';
    const eyebrow = doc.createElement('span');
    eyebrow.className = 'mkg-eyebrow';
    eyebrow.textContent = 'MIKAGE · INTERLUDE';
    const heading = doc.createElement('strong');
    heading.id = 'mkg-dialog-title';
    heading.textContent = scene.place + ' · 此地散策';
    brand.append(eyebrow,heading);
    const closeButton = doc.createElement('button');
    closeButton.className = 'mkg-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label','关闭互动弹窗');
    closeButton.textContent = '×';
    bar.append(brand,closeButton);
    const intro = doc.createElement('div');
    intro.className = 'mkg-intro';
    intro.dataset.region = region;
    const visual = doc.createElement('div');
    visual.className = 'mkg-visual';
    visual.dataset.region = region;
    const cover = artUrl(region, options.period || 'day');
    if (cover) {
      const image = doc.createElement('img');
      image.className = 'mkg-cover';
      image.alt = scene.place + '的预绘场景';
      image.decoding = 'async';
      image.src = cover;
      image.addEventListener('error', () => image.remove(), { once:true });
      visual.append(image);
    }
    if (region === 'R02') {
      const catUrl = artUrl('cat', options.period || 'day');
      if (catUrl) {
        const cat = doc.createElement('img');
        cat.className = 'mkg-cat';
        cat.alt = '石墙边的一只猫';
        cat.decoding = 'async';
        cat.src = catUrl;
        visual.append(cat);
      }
    }
    const placard = doc.createElement('span');
    placard.className = 'mkg-placard';
    placard.textContent = region + ' / ' + scene.place;
    visual.append(placard);
    const copy = doc.createElement('div');
    copy.className = 'mkg-copy';
    const label = doc.createElement('span');
    label.className = 'mkg-section-label';
    label.textContent = '散策前的小笺';
    const title = doc.createElement('h2');
    title.textContent = scene.title;
    const description = doc.createElement('p');
    description.className = 'mkg-description';
    description.textContent = scene.note;
    const tags = doc.createElement('ul');
    tags.className = 'mkg-tags';
    for (const text of scene.tags) {
      const item = doc.createElement('li');
      item.textContent = text;
      tags.append(item);
    }
    copy.append(label,title,description,tags);
    intro.append(visual,copy);
    const foot = doc.createElement('footer');
    foot.className = 'mkg-actions';
    const note = doc.createElement('p');
    note.className = 'mkg-footnote';
    note.textContent = '这段散策不会消耗道具。完成后会写进当前对话的散策手帖。';
    const actions = doc.createElement('div');
    actions.className = 'mkg-action-buttons';
    const begin = doc.createElement('button');
    begin.className = 'mkg-begin';
    begin.type = 'button';
    begin.textContent = '开始这段散策';
    const leave = doc.createElement('button');
    leave.className = 'mkg-leave';
    leave.type = 'button';
    leave.textContent = '先回地图';
    actions.append(begin,leave);
    foot.append(note,actions);
    const gameArea = doc.createElement('div');
    gameArea.className = 'mkg-game';
    gameArea.hidden = true;
    dialog.append(bar,intro,foot,gameArea);
    overlay.append(dialog);
    shadow.append(overlay);
    doc.body.append(mount);

    const previousOverflow = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';
    let closed = false;
    let game = null;
    const opener = doc.activeElement;
    function focusables() {
      return [...shadow.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(node=>!node.hidden && node.getClientRects().length);
    }
    function onKeydown(event) {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) { event.preventDefault();dialog.focus();return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (shadow.activeElement === first || shadow.activeElement === dialog)) { event.preventDefault();last.focus(); }
      else if (!event.shiftKey && (shadow.activeElement === last || !dialog.contains(shadow.activeElement))) { event.preventDefault();first.focus(); }
    }
    function close({ notify=true } = {}) {
      if (closed) return;
      closed = true;
      game?.dispose?.();
      doc.removeEventListener('keydown',onKeydown,true);
      mount.remove();
      if (doc.body.style.overflow === 'hidden') doc.body.style.overflow = previousOverflow;
      if (current === handle) current = null;
      if (opener?.isConnected) opener.focus?.({ preventScroll:true });
      if (notify) {
        try { options.onClose?.(); } catch (error) { console.error('[御影散策] close callback failed',error); }
      }
    }
    function beginGame() {
      intro.hidden = true;
      foot.hidden = true;
      gameArea.hidden = false;
      game = mountActivity(gameArea,{
        region,
        reducedMotion:!!options.reducedMotion,
        period:options.period || 'day',
        art:ART,
        onClose:()=>close(),
        onComplete:result=>{
          try { options.onComplete?.(result); }
          catch (error) { console.error('[御影散策] completion callback failed',error); }
        },
      });
      dialog.scrollTop = 0;
      requestAnimationFrame(()=>gameArea.querySelector('button:not(:disabled)')?.focus({ preventScroll:true }));
    }
    const handle = { close };
    current = handle;
    closeButton.addEventListener('click',()=>close());
    leave.addEventListener('click',()=>close());
    overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
    begin.addEventListener('click',beginGame);
    doc.addEventListener('keydown',onKeydown,true);
    const art = host.MikageCharacterArt || host.parent?.MikageCharacterArt;
    Promise.resolve(art?.installFont?.(doc)).catch(()=>{}).then(async()=>{
      if(!/^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(GAME_FONT_URL))return;
      try{const face=new doc.defaultView.FontFace('Mikage Serif',`url("${GAME_FONT_URL}")`);doc.fonts.add(face);await face.load();}catch{}
    });
    requestAnimationFrame(()=>{if(!closed)begin.focus({ preventScroll:true });});
    return handle;
  }

  const api = {
    version,
    open,
    close(){ current?.close(); },
    dispose(){ current?.close({ notify:false });if(host.MikageMinigames===api)delete host.MikageMinigames; },
  };
  host.MikageMinigames = api;
  host.addEventListener?.('pagehide',api.dispose,{once:true});
  return api;
}
