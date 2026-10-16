// Built as a self-contained remote module. The character card only stores its loader.
export const version = '1.15.0';
export const scriptId = 'minigames';
export const VERSION = version;
export const SCRIPT_ID = scriptId;

const GAME_CSS = "/* Scoped paper theatre. Every action remains a native keyboard-operable button. */\n.mka{--ink:#3c5048;--muted:#768176;--moss:#6d866a;--rose:#bf788a;--paper:#fffaf0;--line:#d9dfce;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:20px;padding:clamp(14px,4vw,25px);font:15px/1.65 \"Mikage Serif\",-apple-system,BlinkMacSystemFont,\"Noto Sans SC\",sans-serif;box-shadow:0 14px 40px #3346320c;isolation:isolate;width:100%;max-width:740px;margin:auto;text-align:left}\n.mka,.mka *{box-sizing:border-box}.mka [hidden]{display:none!important}.mka button{font:inherit;-webkit-tap-highlight-color:transparent}.mka-heading{display:flex;align-items:center;gap:13px;margin-bottom:12px}.mka-emblem{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:50%;background:#e9eedf;color:var(--moss)}.mka-emblem .mka-icon{width:27px;height:27px}.mka-kicker{font-size:10px;letter-spacing:.2em;color:var(--muted)}.mka h3.mka-title{font-size:21px;letter-spacing:.05em;font-weight:600;line-height:1.4;margin:2px 0}.mka-help{font-size:13px;color:#657166;margin:0 0 15px}.mka-icon{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;pointer-events:none}\n.mka-stage{position:relative;min-height:254px;overflow:hidden;border:1px solid #dfe3d5;border-radius:15px;background:radial-gradient(ellipse at 15% 10%,#fffdf5 0,transparent 60%),#f1f0e5;margin-bottom:10px;padding:45px 15px 15px}.mka-scene-caption{position:absolute;top:13px;left:16px;right:16px;font-size:12px;color:#6d796b;z-index:2;line-height:1.5;pointer-events:none}.mka-scenery{position:absolute;inset:0;pointer-events:none;z-index:-1}.mka-stage .mka-scenery{z-index:0}.mka-stage>:not(.mka-scenery){position:relative}.mka-stage>.mka-scene-caption{position:absolute}.mka-progress{min-height:44px;margin:10px 1px;color:#63765e;font-size:13px;display:flex;align-items:center;line-height:1.7}.mka-controls{display:flex;flex-wrap:wrap;gap:8px}.mka-button{position:relative;min-height:46px;min-width:46px;max-width:100%;padding:9px 15px;border:1px solid #c7d1bc;border-radius:11px;background:#e8eddf;color:#3d5943;cursor:pointer;line-height:1.5;transition:background .18s,transform .18s,border-color .18s;touch-action:manipulation;white-space:normal}.mka-button:hover:not(:disabled){background:#dbe5cf;border-color:#8da383;transform:translateY(-1px)}.mka-button:active:not(:disabled){transform:translateY(1px)}.mka-button:focus-visible{outline:3px solid #b47d8e;outline-offset:3px;z-index:5}.mka-button:disabled{cursor:default;opacity:.42}.mka-button.mka-selected{background:#6f886b;color:#fff;border-color:#6f886b}.mka-quiet{background:transparent;color:#737c6d;border-color:#d8ddcf;font-size:12px}.mka-footer{display:flex;justify-content:space-between;gap:10px;border-top:1px solid #e3e6da;margin-top:18px;padding-top:12px}.mka-result{border:1px solid #cbd9c1;border-radius:12px;background:#eff3e7;text-align:center;padding:17px;margin-top:15px;color:#4e694c;font-size:14px}.mka-result>.mka-icon{width:30px;height:30px;margin-bottom:4px}.mka-result p{font-size:12px;margin:5px 0 0;color:#74816d}\n/* Courtyard: tactile leaves move into a real, growing basket. */\n.mka-scenery-courtyard{background:linear-gradient(0deg,#c6d0b3 0,transparent 22%),repeating-linear-gradient(90deg,transparent 0 47px,#bac6b722 48px 49px),linear-gradient(145deg,#e3e5d8,#f3eee0)}.mka-stage .mka-leaves{position:relative;height:170px;margin-right:75px;overflow:visible}.mka-leaf.mka-button{position:absolute!important;width:48px;height:48px;border:0;background:transparent;transform:rotate(var(--turn));padding:7px;color:#b78a4b}.mka-leaf .mka-icon{width:34px;height:34px;fill:#dfc78366}.mka-leaf:nth-child(even){color:#ba7f6c}.mka-leaf.mka-button:hover{background:#fff8;transform:rotate(var(--turn)) scale(1.14)}.mka-stage .mka-basket{position:absolute;right:14px;bottom:19px;width:95px;min-height:87px;text-align:center;padding:8px;border-radius:8px 8px 30px 30px;border:2px solid #b99b6b;background:repeating-linear-gradient(0deg,#cfb990 0 3px,#c4ac7d 4px 5px);color:#654d32;font-size:11px;box-shadow:0 7px 12px #57482d15}.mka-gathered{display:flex;flex-wrap:wrap;justify-content:center;gap:0}.mka-gathered .mka-icon{width:23px;height:23px;color:#926c3d;transform:rotate(var(--turn));fill:#e9d69b}\n/* A distant cat and three beads of patience. */\n.mka-scenery-garden{background:radial-gradient(ellipse at 88% 75%,#9fac8b88 0 17%,transparent 18%),radial-gradient(ellipse at 8% 80%,#aebc9888 0 17%,transparent 18%),linear-gradient(#e6eadc,#f4eadb)}.mka-cat{width:130px;margin:30px 15% 0 auto;text-align:center;color:#9a8675;transform:scale(.8);transform-origin:bottom center;transition:transform .6s,margin .6s}.mka-cat>.mka-icon{width:110px;height:110px;fill:#c1b09c22;stroke-width:.8}.mka-cat span{display:block;font-size:11px;color:#8b8b74}.mka-cat-near{margin-left:auto;margin-right:auto;transform:scale(1)}.mka-patience{display:flex;justify-content:center;gap:9px;margin-top:14px}.mka-dot{width:8px;height:8px;border:1px solid #bfc7ae;border-radius:50%;background:#f5f0df}.mka-dot.mka-lit{background:#8ca279;border-color:#8ca279}.mka-nuzzle{animation:mka-nuzzle .65s ease-in-out}@keyframes mka-nuzzle{50%{transform:rotate(-8deg) scale(1.04)}}\n/* Delicate dango and folded coloured paper. */\n.mka-dango-stick{display:flex;align-items:center;justify-content:center;gap:4px;margin:49px auto 30px;max-width:280px;position:relative;padding:0 23px;min-height:75px}.mka-dango-stick:before{content:\"\";height:5px;background:#bfa67c;position:absolute;left:0;right:0;top:50%;border-radius:4px}.mka-dango-ball{display:grid;place-items:center;width:64px;height:64px;flex-shrink:0;border-radius:50%;border:1px solid #bcbba47a;background:#e7e8d7;position:relative;color:#6b705c;font-size:11px;box-shadow:inset -5px -7px 12px #786b3b12,inset 5px 7px 8px #ffffff7d}.mka-swatch:before{content:\"\";display:inline-block;width:13px;height:13px;border-radius:50%;background:var(--swatch);border:1px solid #9a9d8866;margin-right:8px;vertical-align:-1px}.mka-paper{width:130px;height:130px;margin:25px auto 20px;box-shadow:3px 7px 12px #66543a18;border:1px solid #ffffffaa;transform:rotate(-8deg);display:grid;place-items:center}.mka-paper>.mka-icon{width:75px;height:75px;color:#6a7e7199}.mka-fold-1{background-image:linear-gradient(135deg,transparent 49%,#fff9 50%,transparent 51%)!important}.mka-fold-2{clip-path:polygon(50% 5%,100% 90%,0 90%);transform:none}.mka-fold-3{clip-path:polygon(0 40%,50% 0,100% 40%,80% 95%,20% 95%);transform:none}\n.mka-scenery-stream{background:repeating-linear-gradient(-6deg,transparent 0 26px,#ffffff5c 27px 29px,transparent 30px 50px),linear-gradient(90deg,#c3cdb0 0 10%,#b5d2cf 17% 83%,#c3cdb0 90%)}.mka-stage .mka-boat{position:relative;z-index:2;width:75px;margin:66px auto 15px;transition:transform .5s}.mka-boat>.mka-icon{width:75px;height:75px;stroke:#5d7c79;fill:currentColor}.mka-boat-left{transform:translateX(-65px) rotate(-10deg)}.mka-boat-right{transform:translateX(65px) rotate(10deg)}.mka-stones{position:absolute!important;inset:90px 20px auto;display:flex;justify-content:space-between;pointer-events:none}.mka-stones span{width:48px;height:30px;border-radius:60% 40% 35% 55%;background:#8b9a9366;border-bottom:4px solid #64766f66}.mka-stones-0 span:first-child,.mka-stones-1 span:last-child{visibility:hidden}\n/* Stationery: tickets and coastal tram-stop postcards, never beach furniture. */\n.mka-scenery-platform{background:linear-gradient(0deg,#798b7c22 0 18%,transparent 19%),repeating-linear-gradient(90deg,transparent 0 60px,#b3bda640 61px 62px),linear-gradient(#dde6db,#f2eddd)}.mka-scenery-coast-platform{background:linear-gradient(0deg,#b7b9ac 0 5%,#d6d6c6 6% 15%,#697f7933 16% 17%,transparent 18%),linear-gradient(#e2ece9 0 48%,#a5c9c6 49% 72%,#d5e1d4 73%)}.mka-ticket{background:#fff8e8;margin:28px auto 10px;max-width:300px;padding:17px 22px;border:1px dashed #b6bb9a;border-radius:4px;box-shadow:2px 5px 10px #4d563315;transform:rotate(-3deg);position:relative}.mka-ticket:after{content:\"\";position:absolute;right:17px;top:0;bottom:0;border-left:1px dashed #c9cbb2}.mka-ticket-label{display:block;font-size:9px;letter-spacing:.12em;color:#8a9376}.mka-ticket strong{font-size:17px;font-weight:500}.mka-ticket-stamps{display:flex;gap:11px;margin-top:14px}.mka-stamp-slot{display:grid;place-items:center;width:49px;height:49px;border:1px solid #d5c3b3;border-radius:50%;color:#bd8590;background:#fffaf0}.mka-stamp-slot .mka-icon{width:28px;height:28px;transform:rotate(-12deg)}.mka-postcard{max-width:350px;margin:21px auto 5px;padding:17px;background:#fffbec;box-shadow:2px 5px 14px #37493822;transform:rotate(2deg);border:1px solid #fdfdf4}.mka-collage{display:flex;gap:8px;margin-top:14px}.mka-collage-slot{min-width:0;flex:1;min-height:85px;border:1px dashed #a9b9a0;background:#dfeae266;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#678e83;font-size:10px}.mka-collage-slot:nth-child(2){background:#f2e7d366;color:#b19a6c;transform:rotate(-5deg)}.mka-collage-slot:nth-child(3){background:#e9d9da66;color:#a97783;transform:rotate(4deg)}.mka-collage-slot .mka-icon{width:37px;height:37px;margin-bottom:5px}.mka-card-note{font-size:11px;margin:13px 0 0;color:#7d8879}\n/* Botanical impressions. */\n.mka-scenery-grove{background:radial-gradient(ellipse at 5% 95%,#9aaf7b66 0 25%,transparent 26%),radial-gradient(ellipse at 90% 90%,#afc39988 0 25%,transparent 26%),linear-gradient(#e5ead8,#e9e7ce)}.mka-grove{display:flex;align-items:center;justify-content:space-evenly;gap:10px;min-height:178px}.mka-found-leaf.mka-button{width:27%;background:#fff8;border:1px solid #d7dec5;min-height:115px;padding:12px 3px;display:flex;flex-direction:column;align-items:center;color:#829c68;font-size:11px}.mka-found-leaf .mka-icon{width:47px;height:58px;margin-bottom:5px;stroke-width:1}.mka-found-leaf.mka-found{background:#dfe8ce;opacity:.72}.mka-ginkgo>.mka-icon{transform:rotate(-22deg) scaleX(1.25);color:#a99b4f}.mka-fern>.mka-icon{color:#7a9669}.mka-camellia>.mka-icon{transform:rotate(20deg) scaleX(.7);color:#587e66}.mka-rubbing{background:#fffae9;min-height:154px;margin:22px auto 10px;max-width:330px;border:1px solid #eee6cb;box-shadow:0 5px 10px #5a563014;display:flex;align-items:center;justify-content:space-evenly;transform:rotate(-2deg);color:#9ca58a}.mka-rubbing>div{display:flex;flex-direction:column;align-items:center;font-size:10px}.mka-rubbing .mka-icon{width:53px;height:84px;stroke-width:.7;color:inherit}.mka-rubbing.moss{color:#6d8b61}.mka-rubbing.rose{color:#bb7c89}.mka-rubbing.ochre{color:#b49b58}\n/* Night scenes, understated gold-green lights. */\n.mka-scenery-night,.mka-scenery-night-path{background:radial-gradient(circle at 82% 15%,#e9e6b266 0 5%,transparent 6%),linear-gradient(#40594f,#7c8b70)}.mka-stage-R08 .mka-scene-caption,.mka-stage-R10 .mka-scene-caption{color:#edf0df}.mka-fireflies{display:flex;align-items:center;justify-content:space-evenly;gap:12px;min-height:170px}.mka-firefly.mka-button{width:62px;height:82px;border:1px solid #e2e7bc33;background:#14281f22;color:#b5c2a0;padding:12px 5px}.mka-firefly .mka-icon{width:30px;height:38px;margin:auto;display:block}.mka-firefly span{font-size:11px}.mka-firefly.mka-awake{color:#d8e3af;border-color:#d9e3ad77}.mka-firefly.mka-glow{color:#fff9c7;background:#d8e4a533;box-shadow:0 0 30px 9px #e9f3ac44;transform:translateY(-8px)}.mka-firefly.mka-button:disabled{opacity:1}.mka-firefly:nth-child(2){margin-top:40px}.mka-scenery-night-path{background:linear-gradient(160deg,transparent 0 55%,#c3c4a733 56% 65%,transparent 66%),linear-gradient(#3b514b,#78886f)}.mka-lanterns{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:300px;margin:12px auto 3px}.mka-lantern.mka-button{width:100%;height:81px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:0;color:#c7cfb888;border-color:#cfdbb72b;background:#ffffff08}.mka-lantern .mka-icon{width:33px;height:43px;stroke-width:1}.mka-lantern span{font-size:9px}.mka-lantern.mka-lantern-lit{border-color:#e2d9b388;box-shadow:0 0 15px #ffe8b222;color:#eddca4;background:#e0c98d22}.mka-lantern.mka-sakura{color:#f0bfcb;background:#d69aaf22;box-shadow:0 0 15px #f0bfcb22}.mka-lantern.mka-jade{color:#c2ded0;background:#9ec6b822;box-shadow:0 0 15px #c2ded022}\n/* Drum practice. */\n.mka-drum{margin:11px auto 2px;width:95px;color:#ae7e70}.mka-drum>.mka-icon{width:95px;height:95px;fill:#dbaf8b22;stroke-width:.9}.mka-beats{display:flex;gap:11px;justify-content:center;margin:3px auto 12px}.mka-beat{display:grid;place-items:center;width:43px;height:43px;border:1px solid #d6cbb6;border-radius:50%;color:#b9b099;background:#fff8e9;font-size:15px}.mka-beat-next{border:2px solid #a5b294;color:#5e775b}.mka-beat-done{background:#dbe5cd;color:#55724f}.mka-drum-button{flex:1;min-width:100px;background:#efe2d7;border-color:#d1b8a7;color:#825e51}.mka-hit{animation:mka-hit .2s ease-out}@keyframes mka-hit{45%{transform:scale(.92) rotate(-3deg)}}\n.mka-reduced *{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.mka *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(max-width:390px){.mka{padding:13px;border-radius:15px;font-size:14px}.mka h3.mka-title{font-size:18px}.mka-button{padding:9px 11px}.mka-controls>.mka-button{flex-grow:1}.mka-stage{min-height:247px}.mka-cat{margin-right:6%}.mka-dango-ball{width:56px;height:56px}.mka-scene-caption{font-size:11px}.mka-collage{gap:6px}.mka-postcard{padding:12px}.mka-found-leaf .mka-icon{width:39px}.mka-fireflies{gap:8px}} \n\n.mka-footer .mka-button{display:flex;align-items:center;justify-content:center;gap:6px}.mka-footer .mka-icon{width:16px;height:16px}\n\n/* 1.11 · illustrated pocket stages, designed for narrow touch screens. */\n.mka{--ink:#403c34;--moss:#59745d;--rose:#a96570;position:relative;border-color:#d4c5a6;border-radius:17px;background:linear-gradient(145deg,#fffaf0,#f6efdf);box-shadow:0 12px 34px #382b1d18,inset 0 1px #fff}.mka:before{content:\"\";position:absolute;inset:6px;border:1px solid #cbb99155;border-radius:12px;pointer-events:none}\n.mka-emblem{background:radial-gradient(circle at 35% 25%,#faf3de,#dfe5d1);box-shadow:inset 0 0 0 1px #fff8,0 2px 6px #34452a12}.mka-kicker{letter-spacing:.22em;color:#9b8362}.mka h3.mka-title{color:#4e5542;letter-spacing:.09em}.mka-help{color:#7a7868;line-height:1.75}\n.mka-stage{min-height:300px;height:clamp(280px,52vw,390px);padding:52px 16px 17px;border:1px solid #c8b995;border-radius:13px;background:#ddd7c6;box-shadow:inset 0 0 0 3px #fff6,0 6px 15px #342b1b1c;isolation:isolate}.mka-stage .mka-scenery{z-index:0;overflow:hidden;border-radius:inherit}.mka-stage>:not(.mka-scenery){position:relative;z-index:1}.mka-stage>.mka-scene-caption{z-index:3;top:10px;left:10px;right:10px;width:max-content;max-width:calc(100% - 20px);padding:6px 11px;border:1px solid #fff9;border-radius:999px;background:#fff7e9d9;box-shadow:0 2px 8px #2b312225;color:#595b49;font-size:11px;line-height:1.45;backdrop-filter:blur(4px)}.mka-scene-art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 56%;filter:saturate(.92) contrast(.98)}.mka-scenery:after{content:\"\";position:absolute;inset:0;background:linear-gradient(180deg,#20241615 0%,transparent 37%,#17201a12 100%),linear-gradient(90deg,#fff2,transparent 16% 84%,#1d29141a);pointer-events:none}.mka[data-period=night] .mka-scene-art{filter:saturate(.78) brightness(.78)}.mka[data-period=dusk] .mka-scene-art{filter:saturate(.95) sepia(.08)}\n.mka-progress{min-height:48px;padding:4px 12px;border-left:2px solid #b49467;border-radius:0 8px 8px 0;background:linear-gradient(90deg,#e9e5d6,#f7f2e5 75%);color:#616b55;line-height:1.7}.mka-controls{gap:8px}.mka-controls>.mka-button{flex:1 1 auto;min-width:min(126px,calc(50% - 5px));border-color:#c9b997;border-radius:9px;background:linear-gradient(#fffaf0,#efe6d3);box-shadow:0 2px 0 #d6c7a9;color:#5c5848}.mka-controls>.mka-button:hover:not(:disabled){background:#f7edda;border-color:#ad9267;box-shadow:0 3px 0 #d6c7a9}.mka-controls>.mka-button.mka-selected{background:linear-gradient(#728b70,#596f58);border-color:#596f58;box-shadow:0 2px 0 #465a46;color:#fff9e9}.mka-controls>.mka-button.mka-quiet{background:transparent;box-shadow:none;color:#817b69}.mka-result{border-color:#c9b282;background:linear-gradient(145deg,#f8f0d9,#ede4cb);color:#5a684e;box-shadow:inset 0 0 0 3px #fff8}.mka-result>.mka-icon{color:#9e7943;filter:drop-shadow(0 1px #fff)}\n.mka-stage .mka-leaves{height:190px;margin-right:70px}.mka-leaf.mka-button{min-width:48px;min-height:48px;background:#fff2;border-radius:50%;filter:drop-shadow(0 3px 2px #30281820)}.mka-leaf.mka-button:hover:not(:disabled){background:#fff9;filter:drop-shadow(0 4px 4px #30281845)}.mka-basket{z-index:2}.mka-gathered .mka-icon{animation:mka-leaf-land .36s ease-out both}@keyframes mka-leaf-land{from{opacity:0;transform:translateY(-13px) rotate(var(--turn)) scale(.6)}to{opacity:1;transform:rotate(var(--turn)) scale(1)}}\n.mka-cat{width:150px;margin:38px 12% 0 auto;padding:5px 7px;border-radius:70px 70px 20px 20px;background:#fff6;filter:drop-shadow(0 5px 4px #352a1f38);transition:transform .55s,margin .55s}.mka-cat-art{display:block;width:100%;height:128px;object-fit:contain;filter:drop-shadow(0 3px 2px #3b2d1e40)}.mka-cat span{padding:3px 7px;background:#fff9;border-radius:99px;color:#6f6b55}.mka-cat-near{margin-right:auto;transform:scale(1.08)}.mka-cat-curious .mka-cat-art{animation:mka-cat-curious .75s ease-in-out 2}@keyframes mka-cat-curious{40%{transform:translateY(-4px) rotate(2deg)}70%{transform:translateY(1px) rotate(-2deg)}}\n.mka-sauce{width:max-content;max-width:100%;margin:8px auto 0;padding:6px 14px;border:1px solid #fff9;border-radius:99px;background:#fff9;color:#6f6049;font-size:11px;box-shadow:0 2px 7px #342b1b18}.mka-sauce-honey{background:#f2d9a3d9}.mka-sauce-berry{background:#edc6cbd9}.mka-sauce-tea{background:#d7e2c2e8}\n.mka-paper{border-radius:3px;box-shadow:3px 8px 13px #3028182b,inset 0 0 0 1px #ffffffaa}.mka-paper.mka-fold-flat{clip-path:polygon(4% 25%,96% 25%,91% 83%,9% 83%);transform:none}.mka-paper.mka-fold-swift{clip-path:polygon(50% 0,97% 83%,50% 100%,3% 83%);transform:none}.mka-paper.mka-fold-charm:after{content:\"✦\";position:absolute;right:13px;top:12px;color:#fff8;font-size:21px}.mka-scenery-stream .mka-scene-art{object-position:center 54%}.mka-stage .mka-boat{filter:drop-shadow(0 5px 2px #28413b55)}.mka-boat>.mka-icon{fill:#fff9;stroke:#536f69;stroke-width:1.2}.mka-boat-left{transform:translateX(-60px) rotate(-10deg)}.mka-boat-right{transform:translateX(60px) rotate(10deg)}.mka-stones span{box-shadow:inset 4px 4px 6px #fff3,0 3px 3px #25372c30}\n.mka-river-canvas{display:block;width:min(100%,600px);height:clamp(158px,52vw,250px);max-height:250px;margin:0 auto;border:1px solid #f8fff0a8;border-radius:11px;background:#dcebe0b8;box-shadow:inset 0 0 0 3px #ffffff30,0 4px 12px #314c3b18;touch-action:none;cursor:grab;outline:none}.mka-river-canvas:active{cursor:grabbing}.mka-river-canvas:focus-visible{outline:3px solid #a96570;outline-offset:3px}\n.mka-ticket,.mka-postcard{border-radius:5px;border-color:#d3c39e;background:linear-gradient(145deg,#fffaf0,#f6edda);box-shadow:0 8px 17px #352d1e36,inset 0 0 0 3px #fff9}.mka-ticket{padding:15px 20px}.mka-ticket-stop{display:block;margin-top:4px;color:#9a8565;font-size:10px}.mka-postcard{max-width:320px;padding:12px 14px;transform:rotate(1.2deg)}.mka-photo-view{height:100px;margin:8px 0 7px;display:flex;align-items:center;justify-content:center;gap:9px;border:1px solid #fff9;background:linear-gradient(180deg,#d9e8e6 0 48%,#84aaa5 49% 69%,#e5d6b8 70%);color:#667c6d;overflow:hidden;position:relative}.mka-photo-view:after{content:\"\";position:absolute;inset:auto 0 0;height:22px;background:linear-gradient(#e8dfcc,#c3ab83)}.mka-photo-view .mka-icon{width:41px;height:53px;filter:drop-shadow(0 3px 2px #35423934);z-index:1}.mka-photo-view span{font-size:11px;z-index:1}.mka-frame-blue{border-color:#70979c;box-shadow:0 0 0 4px #9cbec1,inset 0 0 0 8px #e4eeee}.mka-frame-bell{border-color:#b7867f;box-shadow:0 0 0 4px #ead5ca,inset 0 0 0 8px #fff4e9}\n.mka-lanterns.mka-layout-row{grid-template-columns:repeat(6,minmax(0,1fr));gap:5px}.mka-lanterns.mka-layout-arc .mka-lantern:nth-child(odd){transform:translateY(-8px)}.mka-lanterns.mka-layout-path .mka-lantern:nth-child(3n+2){transform:translateY(6px)}.mka-lantern.mka-button{box-shadow:inset 0 0 0 2px #fff1,0 3px 9px #121e2625;border-radius:10px}.mka-lantern.mka-lantern-lit{animation:mka-lantern-in .34s ease-out both}@keyframes mka-lantern-in{0%{filter:brightness(.8);transform:scale(.88)}65%{filter:brightness(1.35);transform:scale(1.06)}100%{filter:brightness(1);transform:scale(1)}}\n@media(max-width:520px){.mka-stage{height:clamp(280px,80vw,360px);padding:48px 10px 12px}.mka-controls>.mka-button{min-width:calc(50% - 5px);padding:9px 9px;font-size:13px}.mka-stage .mka-leaves{margin-right:57px}.mka-basket{right:7px!important;width:82px!important}.mka-cat{width:135px;margin-right:7%}.mka-cat-art{height:116px}.mka-lanterns.mka-layout-row{grid-template-columns:repeat(3,minmax(0,1fr))}.mka-postcard{max-width:min(320px,96%);padding:10px}.mka-photo-view{height:88px}.mka-collage-slot{min-height:51px}}\n@media(prefers-reduced-motion:reduce){.mka-gathered .mka-icon,.mka-cat-curious .mka-cat-art,.mka-lantern.mka-lantern-lit{animation:none!important}}\n.mka-stage[data-wind=soft] .mka-leaf{animation:mka-leaf-drift-soft 3.8s ease-in-out infinite alternate}.mka-stage[data-wind=cross] .mka-leaf{animation:mka-leaf-drift-cross 2.8s ease-in-out infinite alternate}.mka-stage[data-wind=west] .mka-leaf{animation:mka-leaf-drift-west 3.1s ease-in-out infinite alternate}\n@keyframes mka-leaf-drift-soft{to{margin-left:4px;filter:drop-shadow(0 5px 5px #3028183b)}}@keyframes mka-leaf-drift-cross{to{margin-left:10px;transform:rotate(calc(var(--turn) + 16deg)) translateX(5px)}}@keyframes mka-leaf-drift-west{to{margin-left:-8px;transform:rotate(calc(var(--turn) - 14deg)) translateX(-5px)}}\n.mka-photo-view{background-size:cover!important;background-position:center 58%;text-shadow:0 1px 5px #1c2733a8}.mka-photo-view.mka-view-lighthouse{background-position:58% 53%}.mka-photo-view.mka-view-tram{background-position:19% 70%}.mka-photo-view.mka-view-firefly{background-position:82% 54%}\n@media(prefers-reduced-motion:reduce){.mka-stage[data-wind] .mka-leaf{animation:none!important}}\n.mka-stage.mka-stage-R06{height:clamp(340px,52vw,400px)}\n@media(max-width:520px){.mka-stage.mka-stage-R06{height:clamp(350px,96vw,400px)}}\n\n/* R03 · tactile dango counter, fire-control puzzle and finished recipe card. */\n.mka-stage.mka-stage-R03{height:clamp(340px,76vw,430px);padding:54px 14px 14px;background:#74533b}\n.mka-stage-R03 .mka-scene-art{object-position:center 62%;filter:saturate(1.02) contrast(1.02)}\n.mka-stage-R03 .mka-scenery:after{background:linear-gradient(180deg,#2c20153b,transparent 34%,#30201508 68%,#27190c22)}\n.mka-stage-R03 .mka-dango-steps{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:clamp(4px,2vw,11px);width:max-content;max-width:100%;margin:1px auto 0;padding:7px 10px;border:1px solid #fff9;border-radius:999px;background:#fff5e9e8;box-shadow:0 4px 14px #21150930;backdrop-filter:blur(8px)}\n.mka-stage-R03 .mka-dango-step{display:inline-flex;align-items:center;gap:4px;color:#8e8069;font-size:10px;white-space:nowrap}\n.mka-stage-R03 .mka-dango-step i{display:grid;place-items:center;width:19px;height:19px;border:1px solid #cbb99a;border-radius:50%;background:#fffaf0;color:#8d7653;font:normal 10px/1 sans-serif}\n.mka-stage-R03 .mka-dango-step.is-current{color:#653e35;font-weight:700}.mka-stage-R03 .mka-dango-step.is-current i{border-color:#a95756;background:#a95756;color:#fff8e9}.mka-stage-R03 .mka-dango-step.is-done i{border-color:#71886d;background:#71886d;color:#fff}\n.mka-stage-R03 .mka-dango-stick{position:absolute;z-index:2;left:50%;bottom:14%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;gap:clamp(4px,1.2vw,12px);width:min(90%,410px);min-height:82px;margin:0;padding:7px 19px;filter:drop-shadow(0 7px 5px #38241855);transition:filter .25s}\n.mka-stage-R03 .mka-dango-stick:before{left:5%;right:5%;top:50%;height:5px;border:1px solid #e9cb91;background:linear-gradient(#c69757,#815b35);box-shadow:0 2px 4px #34211055}\n.mka-stage-R03 .mka-dango-ball{display:grid;place-items:center;position:relative;z-index:1;width:clamp(46px,14vw,70px);height:clamp(46px,14vw,70px);border:1px solid #fff9;border-radius:50%;background:radial-gradient(circle at 32% 26%,#fff9 0 7%,transparent 25%),radial-gradient(circle at 38% 30%,var(--ball-color,#eee4ca) 0 49%,color-mix(in srgb,var(--ball-color,#eee4ca),#63402d 28%) 100%);box-shadow:inset -5px -7px 10px #5b351a1c,inset 5px 5px 8px #fff8,0 3px 7px #3c241b3d;color:#786149;font:11px/1 sans-serif;transition:transform .25s,filter .25s}\n.mka-stage-R03 .mka-dango-ball[aria-label$=\"待选\"]{background:radial-gradient(circle at 35% 30%,#fff9,#e7dac188 58%,#9e79544a);color:#8d7559;font-size:18px}\n.mka-stage-R03 .mka-dango-ball.is-roasted:after{content:\"\";position:absolute;inset:8px;border:2px dotted #9b603b77;border-radius:50%;transform:rotate(-18deg)}\n.mka-stage-R03 .mka-dango-ball.is-current{z-index:2;transform:translateY(-8px) scale(1.08);border-color:#fff;box-shadow:inset -5px -7px 10px #5b351a1c,inset 5px 5px 8px #fff8,0 0 0 3px #fff4,0 8px 13px #54301866}\n.mka-stage-R03 .mka-dango-ball.mka-dango-added{animation:mka-dango-ball-pop .34s cubic-bezier(.2,.75,.3,1.3) both}\n.mka-stage-R03 .mka-dango-ball.is-roasted{animation:mka-dango-golden .38s ease-out both}\n.mka-stage-R03 .mka-dango-stick.is-finished{filter:drop-shadow(0 0 12px #fff0b8cc) drop-shadow(0 7px 5px #38241855)}\n.mka-stage-R03 .mka-roast-card{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:9px;width:min(92%,360px);margin:24px auto 0;padding:12px 16px 13px;border:1px solid #fff9;border-radius:17px;background:linear-gradient(145deg,#fffaf0ed,#f4e5d4e8);box-shadow:0 9px 24px #2c1d1540,inset 0 0 0 3px #fff8;backdrop-filter:blur(9px);text-align:center}\n.mka-stage-R03 .mka-roast-label{font-size:10px;letter-spacing:.12em;color:#897357}.mka-stage-R03 .mka-roast-message{min-height:25px;color:#544638;font-size:13px;font-weight:600}\n.mka-stage-R03 .mka-heat-meter{display:grid;grid-template-columns:repeat(3,minmax(74px,1fr));gap:6px;width:100%;margin-top:2px}\n.mka-stage-R03 .mka-heat-cell{display:flex;align-items:center;justify-content:center;gap:6px;min-height:36px;border:1px solid #dfd2bb;border-radius:9px;background:#f7f0e2;color:#9b8c74;transition:all .2s}\n.mka-stage-R03 .mka-heat-cell i{position:relative;width:11px;height:14px;border-radius:60% 40% 55% 45%;background:#c9bba1;transform:rotate(45deg)}\n.mka-stage-R03 .mka-heat-cell.is-active{border-color:#bd7f53;background:#fff0d5;color:#744a34;box-shadow:0 2px 7px #a35d3420}.mka-stage-R03 .mka-heat-cell.is-active i{background:linear-gradient(45deg,#c75b3d,#f3c06c);box-shadow:0 0 9px #e8a55388}\n.mka-stage-R03 .mka-finish-note{position:absolute;z-index:3;left:50%;bottom:3%;transform:translateX(-50%);display:grid;gap:2px;width:max-content;max-width:90%;padding:7px 13px;border:1px solid #fff9;border-radius:11px;background:#fff5e9e8;box-shadow:0 3px 10px #30201625;text-align:center;color:#5c5442;font-size:12px;backdrop-filter:blur(7px)}\n.mka-stage-R03 .mka-finish-note span{font-size:10px;color:#8c7a60}\n.mka-stage-R03 .mka-dango-seal{position:absolute;z-index:3;right:5%;top:27%;display:grid;justify-items:center;gap:2px;min-width:86px;padding:8px 9px;border:2px solid #a45d4d;border-radius:50%;background:#fff2e5dc;color:#945147;box-shadow:0 3px 9px #39211635;transform:rotate(8deg);animation:mka-dango-seal-in .42s ease-out both}\n.mka-stage-R03 .mka-dango-seal .mka-icon{width:24px;height:24px}.mka-stage-R03 .mka-dango-seal span{font-size:9px;line-height:1.3}.mka-stage-R03 .mka-dango-seal b{font-size:10px;font-weight:500}\n.mka-controls .mka-swatch:before{width:16px;height:16px;margin-right:7px;vertical-align:-3px;box-shadow:inset -2px -3px 4px #3d291c20,inset 2px 2px 3px #fff9,0 1px 3px #33231924}\n.mka-stage-R03 .mka-scene-caption{color:#fff8e8;background:#493627d9;border-color:#f0d8b088;box-shadow:0 3px 8px #20130f40}\n.mka-stage-R03:has(.mka-roast-card) .mka-dango-stick{bottom:8%}\n@keyframes mka-dango-seal-in{from{opacity:0;transform:rotate(18deg) scale(.6)}to{opacity:1;transform:rotate(8deg) scale(1)}}\n@keyframes mka-dango-ball-pop{from{opacity:.3;transform:translateY(18px) scale(.5)}to{opacity:1;transform:translateY(0) scale(1)}}\n@keyframes mka-dango-golden{45%{filter:brightness(1.25);box-shadow:inset -5px -7px 10px #5b351a1c,inset 5px 5px 8px #fff8,0 0 18px #ffd88a}}\n@media(max-width:520px){.mka-stage.mka-stage-R03{height:clamp(340px,103vw,400px);padding:52px 8px 10px}.mka-stage-R03 .mka-dango-steps{gap:5px;padding:6px 8px}.mka-stage-R03 .mka-dango-step{font-size:9px}.mka-stage-R03 .mka-roast-card{margin-top:21px;padding:10px 9px}.mka-stage-R03 .mka-heat-meter{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}.mka-stage-R03 .mka-heat-cell{min-height:34px;gap:4px;font-size:10px}.mka-stage-R03 .mka-dango-stick{bottom:13%;min-height:68px;padding:5px 10px}.mka-stage-R03:has(.mka-roast-card) .mka-dango-stick{bottom:7%}.mka-stage-R03 .mka-finish-note{bottom:2%}}\n@media(prefers-reduced-motion:reduce){.mka-stage-R03 .mka-dango-seal,.mka-stage-R03 .mka-dango-ball{animation:none!important}}\n\n/* R05 · route card and ordered travel stamps. */\n.mka-stage.mka-stage-R05{height:clamp(340px,76vw,430px);padding:53px 10px 12px}.mka-stage-R05 .mka-scene-art{object-position:center 64%;filter:saturate(.95)}\n.mka-stage-R05 .mka-ticket{position:relative;z-index:2;width:min(100%,390px);margin:12px auto 5px;padding:12px 15px;transform:rotate(-1deg);background:linear-gradient(140deg,#fffaf0f2,#f1e4d0ed);backdrop-filter:blur(7px)}\n.mka-stage-R05 .mka-ticket strong{display:block;font-size:17px}.mka-route-track{display:flex;align-items:flex-start;justify-content:space-between;gap:3px;position:relative;margin:15px 0 9px;padding-top:2px}.mka-route-track:before{content:\"\";position:absolute;top:12px;left:7%;right:7%;height:2px;background:repeating-linear-gradient(90deg,#ba9c73 0 7px,transparent 7px 11px)}\n.mka-route-stop{position:relative;z-index:1;display:grid;justify-items:center;gap:4px;width:25%;min-width:0;text-align:center}.mka-route-stop i{display:grid;place-items:center;width:24px;height:24px;border:1px solid #c4ad88;border-radius:50%;background:#fff8e9;color:#866a43;font:normal 10px/1 sans-serif}.mka-route-stop b{max-width:100%;color:#75654d;font-size:9px;font-weight:500;line-height:1.3;overflow-wrap:anywhere}.mka-route-stop.is-planned i{background:#718a6a;border-color:#718a6a;color:#fff}.mka-route-stop.is-destination i{background:#b9685a;border-color:#b9685a;color:#fff}.mka-route-stop.is-next i{border-style:dashed;background:#fff8;color:#9d8e72}.mka-ticket-stamps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}.mka-stamp-slot{position:relative;width:auto;height:54px;min-width:0;border-radius:8px;background:#fffcf3d9}.mka-stamp-slot small{position:absolute;left:3px;right:3px;top:3px;color:#8b7a60;font-size:8px;line-height:1.2;text-align:center}.mka-stamp-slot .mka-icon{width:26px;height:26px;margin-top:13px}.mka-stamp-slot>b{margin-top:11px;color:#b29a72;font-size:15px;font-weight:400}.mka-stamp-slot.is-active{border:2px solid #bd8c56;box-shadow:0 0 0 3px #f5dfb788,0 2px 8px #8e633433;animation:mka-ticket-pulse 1.4s ease-in-out infinite alternate}.mka-controls>.mka-route-choice,.mka-controls>.mka-stamp-choice{background:linear-gradient(#fff9ed,#efe1c9);border-color:#c5a87d;color:#5f5441}.mka-controls>.mka-route-choice:before{content:\"＋\";display:inline-block;margin-right:6px;color:#9c714a;font-size:13px}\n@keyframes mka-ticket-pulse{to{filter:brightness(1.08);transform:translateY(-2px)}}\n\n/* R07 · fingers or a large-button fallback reveal an actual canvas rubbing. */\n.mka-stage.mka-stage-R07{height:clamp(345px,78vw,420px);padding:51px 10px 12px}.mka-stage-R07 .mka-scene-art{object-position:center 56%}.mka-stage-R07 .mka-rubbing{position:relative;z-index:2;display:block;width:min(100%,460px);min-height:0;margin:34px auto 5px;padding:7px;border:1px solid #e8d9b7;border-radius:11px;background:#f7edd8ed;box-shadow:0 11px 25px #3429184a,inset 0 0 0 3px #fff9;transform:rotate(-1.5deg);backdrop-filter:blur(6px)}.mka-stage-R07 .mka-rubbing-canvas{display:block;width:100%;height:auto;aspect-ratio:2/1;border-radius:5px;touch-action:none;cursor:crosshair;box-shadow:inset 0 0 0 1px #c7b691}.mka-stage-R07 .mka-rubbing-canvas:focus-visible{outline:3px solid #a96570;outline-offset:2px}.mka-stage-R07 .mka-rubbing-done{position:absolute;z-index:3;right:8%;top:24%;display:grid;justify-items:center;gap:5px;padding:13px 16px;border:2px solid #a87062;border-radius:50%;background:#fff5e8e8;color:#92594b;box-shadow:0 4px 12px #37251e35;transform:rotate(8deg)}.mka-stage-R07 .mka-rubbing-done .mka-icon{width:25px;height:25px}.mka-stage-R07 .mka-rubbing-done b{font-size:10px;font-weight:500}\n\n/* R08 · four firefly lights and two increasingly long memory phrases. */\n.mka-stage.mka-stage-R08{height:clamp(330px,72vw,400px);padding:55px 12px 14px}.mka-stage-R08 .mka-scene-art{object-position:center 57%;filter:saturate(.92) brightness(.78)}.mka-stage-R08 .mka-scenery:after{background:linear-gradient(180deg,#0a143655 0%,transparent 48%,#101a3040 100%)}.mka-stage-R08 .mka-scene-caption{color:#f4edcf;background:#1c2635d9;border-color:#d3d5ad66}.mka-stage-R08 .mka-fireflies{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));align-items:center;justify-items:center;gap:clamp(4px,2vw,15px);min-height:175px;max-width:420px;margin:42px auto 3px}.mka-stage-R08 .mka-firefly.mka-button{width:100%;max-width:86px;height:110px;margin:0;padding:10px 3px;border:1px solid #dce9bf44;border-radius:50px 50px 22px 22px;background:#13213842;color:#bdcc9a;box-shadow:inset 0 0 0 3px #ffffff08;backdrop-filter:blur(3px)}.mka-stage-R08 .mka-firefly .mka-icon{width:36px;height:48px;margin:auto;display:block}.mka-stage-R08 .mka-firefly span{font-size:10px}.mka-stage-R08 .mka-firefly.mka-awake{border-color:#d9e6af8a;color:#e2edbd}.mka-stage-R08 .mka-firefly.mka-glow{color:#fff8c8;background:#e5f1af40;box-shadow:0 0 30px 12px #e9f3ac70;transform:translateY(-8px) scale(1.05)}.mka-stage-R08 .mka-firefly.mka-button:disabled{opacity:1}\n\n/* R09 · layered taiko canvas against the illustrated kagura hall. */\n.mka-stage.mka-stage-R09{height:clamp(340px,75vw,410px);padding:55px 10px 13px}.mka-stage-R09 .mka-scene-art{object-position:center 65%;filter:saturate(1.02)}.mka-stage-R09 .mka-drum{position:relative;z-index:2;width:min(55%,230px);margin:29px auto -8px;filter:drop-shadow(0 12px 9px #21171166);transition:transform .16s,filter .16s}.mka-stage-R09 .mka-drum-canvas{display:block;width:100%;height:auto;aspect-ratio:12/7}.mka-stage-R09 .mka-drum.mka-hit{filter:drop-shadow(0 0 16px #ffd48a9c) drop-shadow(0 9px 6px #21171166)}.mka-stage-R09 .mka-beats{position:relative;z-index:2;width:max-content;max-width:100%;margin:9px auto 4px;padding:7px 10px;border:1px solid #fff8;border-radius:999px;background:#fff4e3e8;box-shadow:0 3px 9px #25170f40;backdrop-filter:blur(5px)}.mka-stage-R09 .mka-beat{width:39px;height:39px;border-color:#d1b895;background:#fff9ed;color:#8b775d;font-size:13px}.mka-stage-R09 .mka-beat-next{border:2px solid #b16f4b;background:#fff1d2;color:#793f31;box-shadow:0 0 0 3px #efca9277,0 3px 8px #6129182a;transform:translateY(-3px)}.mka-stage-R09 .mka-beat-done{border-color:#728966;background:#dfe9d0;color:#526c4b}\n\n/* R10 · night scene, route-shaped lantern board and warm layered light. */\n.mka-stage.mka-stage-R10{height:clamp(345px,77vw,420px);padding:55px 10px 12px}.mka-stage-R10 .mka-scene-art{object-position:center 60%;filter:saturate(.93) brightness(.78)}.mka-stage-R10 .mka-scenery:after{background:linear-gradient(180deg,#10182747 0%,transparent 38%,#131a2140 100%)}.mka-stage-R10 .mka-scene-caption{color:#fff3d2;background:#263040d9;border-color:#e6c77a66}.mka-stage-R10 .mka-lanterns{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:center;gap:8px;max-width:370px;min-height:205px;margin:24px auto 1px;padding:14px 11px;border:1px solid #fff2;border-radius:18px;background:linear-gradient(155deg,#19263755,#0e17243b);box-shadow:inset 0 0 0 2px #ffffff0b;backdrop-filter:blur(3px)}.mka-stage-R10 .mka-lanterns:before{content:\"\";position:absolute;inset:17% 16%;z-index:-1;border:2px dashed #f4d99a36;border-radius:50%;transform:rotate(-10deg)}.mka-stage-R10 .mka-lantern.mka-button{height:82px;min-height:72px;border:1px solid #fff2;border-radius:17px 17px 13px 13px;background:#ffffff08;color:#d9d6bd88;box-shadow:inset 0 0 0 2px #fff1,0 4px 10px #090e1640;transition:all .25s}.mka-stage-R10 .mka-lantern .mka-icon{width:34px;height:43px;stroke-width:1.2}.mka-stage-R10 .mka-lantern span{font-size:10px}.mka-stage-R10 .mka-lantern.mka-lantern-lit{border-color:#fff5c77c;background:#ffd77a20;color:#f8dfa1;box-shadow:0 0 18px #ffd77a50,inset 0 0 0 2px #fff2}.mka-stage-R10 .mka-lantern.mka-sakura{color:#ffd1df;background:#d67d9a24;box-shadow:0 0 18px #f0a7c24d}.mka-stage-R10 .mka-lantern.mka-jade{color:#c9f2d5;background:#7bc99c24;box-shadow:0 0 18px #8ddba34d}\n@media(max-width:520px){.mka-stage.mka-stage-R05{height:clamp(345px,96vw,390px);padding:51px 7px 9px}.mka-stage-R05 .mka-ticket{margin-top:24px;padding:10px 9px}.mka-route-stop b{font-size:8px}.mka-stage.mka-stage-R07{height:clamp(350px,98vw,395px);padding:51px 7px 8px}.mka-stage-R07 .mka-rubbing{margin-top:35px;padding:5px}.mka-stage.mka-stage-R08{height:clamp(330px,90vw,370px);padding:52px 7px 8px}.mka-stage-R08 .mka-fireflies{gap:4px;margin-top:48px}.mka-stage-R08 .mka-firefly.mka-button{height:94px}.mka-stage.mka-stage-R09{height:clamp(345px,95vw,390px);padding:52px 6px 8px}.mka-stage-R09 .mka-drum{width:min(58%,210px);margin-top:38px}.mka-stage-R09 .mka-beat{width:35px;height:35px}.mka-stage.mka-stage-R10{height:clamp(345px,96vw,395px);padding:52px 6px 8px}.mka-stage-R10 .mka-lanterns{gap:5px;min-height:195px;margin-top:28px;padding:10px 5px}.mka-stage-R10 .mka-lantern.mka-button{height:73px;min-height:68px}}\n@media(prefers-reduced-motion:reduce){.mka-stage-R05 .mka-stamp-slot.is-active{animation:none!important}}\n\n/* Hand-painted CSS sprites keep the two night games crisp without SVG gameplay art. */\n.mka-stage-R08 .mka-firefly-sprite{position:relative;display:block;width:36px;height:48px;margin:auto;background:radial-gradient(ellipse at 50% 58%,#fff9c7 0 8%,#d9f4a8 11% 20%,#c5e89a22 28%,transparent 64%);filter:drop-shadow(0 0 5px #def3a56b)}\n.mka-stage-R08 .mka-firefly-sprite:before{content:\"\";position:absolute;left:3px;top:13px;width:30px;height:15px;border:0;border-radius:50%;background:radial-gradient(ellipse at 28% 58%,#dbe8c2bb 0 23%,#a6bc9570 45%,transparent 72%),radial-gradient(ellipse at 72% 58%,#dbe8c2bb 0 23%,#a6bc9570 45%,transparent 72%);transform:rotate(-8deg)}\n.mka-stage-R08 .mka-firefly-sprite:after{content:\"\";position:absolute;left:15px;top:13px;width:7px;height:27px;border-radius:55% 55% 48% 48%;background:radial-gradient(circle at 50% 8%,#cdd4b4 0 2px,transparent 2.5px),linear-gradient(#384332 0 27%,#e7f6b4 40%,#d8ee9c 76%,#83965c 100%);box-shadow:0 0 11px 4px #e7f7bbaa}\n.mka-stage-R08 .mka-firefly.mka-glow .mka-firefly-sprite{filter:drop-shadow(0 0 12px #f7ffc6)}\n.mka-stage-R10 .mka-lantern-sprite{position:relative;display:block;width:29px;height:36px;margin:0 auto 3px;border:1px solid #fff3;border-radius:45% 45% 36% 36%;background:linear-gradient(90deg,#8f71494a,#ffe4ab9c 27% 72%,#8f71494a);box-shadow:inset 0 0 8px #ffe8ba55,0 2px 4px #050a103c}\n.mka-stage-R10 .mka-lantern-sprite:before{content:\"\";position:absolute;left:3px;right:3px;top:-4px;height:3px;border-radius:50%;background:#dac7a0;box-shadow:0 40px 0 -0.5px #d0bd96}.mka-stage-R10 .mka-lantern-sprite:after{content:\"\";position:absolute;inset:0 7px;border-left:1px solid #fff4;border-right:1px solid #fff4;border-radius:50%}\n.mka-stage-R10 .mka-lantern.mka-lantern-lit .mka-lantern-sprite{background:linear-gradient(90deg,#b88743,#fff1b9 35% 68%,#b88743);box-shadow:0 0 15px #ffe79c,inset 0 0 8px #fff7}.mka-stage-R10 .mka-lantern.mka-sakura .mka-lantern-sprite{background:linear-gradient(90deg,#a45d72,#ffd5df 35% 68%,#a45d72);box-shadow:0 0 15px #f4b4ca,inset 0 0 8px #fff8}.mka-stage-R10 .mka-lantern.mka-jade .mka-lantern-sprite{background:linear-gradient(90deg,#4d8062,#d6f6dc 35% 68%,#4d8062);box-shadow:0 0 15px #a2efbc,inset 0 0 8px #fff8}\n\n/* 1.14 · three small shared moments, with room for scenery and conversation. */\n.mka .mka-workflow{position:relative;z-index:3;display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:6px;width:fit-content;max-width:100%;margin:0 auto 12px;padding:7px 11px;border:1px solid #fffc;border-radius:999px;background:#fff9eeed;box-shadow:0 4px 13px #392d1d24;backdrop-filter:blur(7px)}\n.mka-workflow>span{display:flex;align-items:center;gap:5px;padding:2px 6px;border-radius:99px;font-size:10px;color:#93836d;line-height:1.5}.mka-workflow>span.is-current{background:#647d61;color:#fff9e9;box-shadow:0 2px 4px #34472f24}.mka-workflow>span.is-done{color:#56704f}.mka-workflow>span.is-done:before{content:\"✓\";font:11px/1 sans-serif}.mka-workflow i{font-style:normal}\n.mka .mka-story{position:relative;z-index:2;display:grid;gap:7px;margin:12px 0;padding:12px 14px;border:1px solid #d8c7a7;border-radius:13px;background:linear-gradient(120deg,#fffaf2,#f5edde);box-shadow:0 3px 10px #382b1d0b,inset 0 0 0 3px #fff8;text-align:left;overflow-wrap:anywhere}\n.mka-story:before{content:\"\";position:absolute;top:0;bottom:0;left:8px;width:2px;background:linear-gradient(transparent,#b8a28477 20% 80%,transparent)}\n.mka-story p{margin:0;padding-left:5px;font-size:12px;line-height:1.85;color:#685d4d}.mka-story .mka-story-tomoe{color:#4c6251}.mka-story .mka-story-player{color:#916778}.mka-story strong,.mka-story b{font-weight:600}\n.mka-stage.mka-stage-R01,.mka-stage.mka-stage-R02,.mka-stage.mka-stage-R06{height:auto;min-height:360px;padding:52px 13px 15px;overflow:hidden}\n.mka-stage-R01 .mka-scene-art{object-position:center 58%}.mka-stage-R02 .mka-scene-art{object-position:center 57%}.mka-stage-R06 .mka-scene-art{object-position:center 60%}\n/* A little courtyard: a generous sweep surface and a visible destination. */\n.mka-stage .mka-yard-board{position:relative;z-index:2;min-height:232px;margin:8px 0 0;border:1px solid #fff5;border-radius:14px;background:linear-gradient(180deg,#fff4,transparent 25%,#5b583316);touch-action:none;overflow:hidden}\n.mka-yard-wind{position:absolute;left:10px;top:9px;max-width:calc(100% - 20px);padding:5px 10px;border:1px solid #fff9;border-radius:99px;background:#fff7e5e8;color:#7a6e52;font-size:10px;line-height:1.6;box-shadow:0 2px 7px #39321918;pointer-events:none}\n.mka-yard-leaf.mka-button{position:absolute!important;left:var(--x,30%);top:var(--y,40%);display:grid;place-items:center;min-width:48px;min-height:48px;width:52px;height:52px;padding:6px;border:1px solid #fff6;border-radius:50%;background:#fff5;box-shadow:0 3px 8px #4b372c16;color:#af723f;transform:translate(-50%,-50%) rotate(var(--turn,0deg));touch-action:none;cursor:grab;transition:background .2s,box-shadow .2s,opacity .2s}\n.mka-yard-leaf.mka-button:active{cursor:grabbing;transform:translate(-50%,-50%) rotate(var(--turn,0deg)) scale(1.12);background:#fff9;box-shadow:0 5px 12px #4b372c36}\n.mka-yard-leaf.mka-button:hover:not(:disabled){background:#fff9;box-shadow:0 5px 12px #4b372c36;transform:translate(-50%,-50%) rotate(var(--turn,0deg)) scale(1.08)}\n.mka-yard-leaf .mka-icon{width:34px;height:34px;fill:#deb86ba8;stroke-width:1}.mka-yard-leaf:nth-of-type(3n){color:#a05e4e}.mka-yard-leaf:nth-of-type(3n) .mka-icon{fill:#cf9379b8}.mka-yard-leaf:nth-of-type(3n + 1){color:#a08e3c}.mka-yard-leaf:nth-of-type(3n + 1) .mka-icon{fill:#d0c56ba8}\n.mka-yard-trail{position:absolute;bottom:14px;left:12px;right:112px;min-height:33px;padding:6px 9px;border:1px dashed #fff9;border-radius:10px;background:#fff4;color:#655f49;font-size:10px;line-height:1.7;pointer-events:none}\n.mka-yard-basket{position:absolute;right:9px;bottom:10px;width:91px;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:9px 6px;border:2px solid #a78555;border-radius:12px 12px 31px 31px;background:repeating-linear-gradient(0deg,#d6bf96 0 4px,#b99a6a 4px 5px);box-shadow:inset 0 0 0 3px #f2dcad55,0 6px 9px #513b2b35;color:#5c442b;font-size:11px;text-align:center;pointer-events:none}\n.mka-yard-basket:before{content:\"\";position:absolute;top:-17px;left:16px;right:16px;height:25px;border:3px solid #ac8a58;border-bottom:0;border-radius:25px 25px 0 0;z-index:-1}.mka-yard-basket .mka-icon{width:22px;height:22px;fill:#d6ad56;color:#8b663e}\n.mka-yard-arrangement{position:relative;width:min(100%,360px);height:205px;margin:14px auto 3px;border:1px solid #fff7;border-radius:50% 50% 18px 18px;background:radial-gradient(ellipse,#fff4,transparent 68%);box-shadow:inset 0 -10px 20px #34402a0d}\n.mka-yard-arrangement[data-layout=clear]:before{content:\"\";position:absolute;inset:15% 27% 0;transform:perspective(150px) rotateX(18deg);border:1px solid #d7d6b999;background:repeating-linear-gradient(0deg,#c4c8b5bb 0 23px,#eee9d2bb 24px 27px);border-radius:35% 35% 3px 3px;box-shadow:0 3px 8px #4b482322}\n.mka-yard-token{position:absolute;left:var(--x,50%);top:var(--y,50%);display:block;width:28px;height:36px;transform:translate(-50%,-50%) rotate(var(--turn,0deg));color:#b37c3c;filter:drop-shadow(0 2px 2px #53422c35);animation:mka-yard-settle .35s ease-out both}.mka-yard-token .mka-icon{width:100%;height:100%;fill:#d6af65;stroke-width:.9}.mka-yard-token:nth-child(even) .mka-icon{fill:#c68f74;color:#995e4a}\n@keyframes mka-yard-settle{from{opacity:0;margin-top:-10px}to{opacity:1;margin-top:0}}\n/* Let the cat occupy the scene; the painted art stays the visual focus. */\n.mka-stage .mka-cat-scene{position:relative;z-index:2;min-height:220px;width:min(100%,390px);margin:5px auto 0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:12px 10px 7px;isolation:isolate}\n.mka-cat-scene:before{content:\"\";position:absolute;z-index:-1;bottom:27px;width:165px;height:24px;border-radius:50%;background:#3c392a35;filter:blur(6px)}\n.mka-cat-scene .mka-cat-portrait{display:block;position:relative;z-index:2;width:min(62%,200px);height:160px;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 5px 3px #39271d38);transform-origin:center bottom;transition:transform .5s,filter .5s;pointer-events:none}\n.mka-cat-scene[data-mood=watch] .mka-cat-portrait{transform:translateX(27px) scale(.84)}.mka-cat-scene[data-mood=curious] .mka-cat-portrait{transform:translateX(9px) rotate(-3deg) scale(.95)}.mka-cat-scene[data-mood=relaxed] .mka-cat-portrait{transform:scale(1.04)}.mka-cat-scene[data-mood=sleepy] .mka-cat-portrait{transform:translateY(8px) scale(1.03,.9);filter:drop-shadow(0 5px 3px #39271d38) saturate(.85)}\n.mka-cat-tail{position:absolute;z-index:1;bottom:51px;right:calc(50% - 95px);width:60px;height:52px;border-right:13px solid #a88863;border-bottom:13px solid #a88863;border-radius:0 0 48px 0;transform:rotate(-12deg);transform-origin:5px 43px;filter:drop-shadow(0 3px 2px #39271d24);opacity:.7;pointer-events:none}.mka-cat-scene[data-mood=curious] .mka-cat-tail{animation:mka-tail-question 2.6s ease-in-out infinite alternate}.mka-cat-scene[data-mood=sleepy] .mka-cat-tail{transform:rotate(30deg) scale(.85);opacity:.5}\n.mka-cat-caption{position:relative;z-index:3;max-width:100%;margin:7px 0 0;padding:7px 12px;border:1px solid #fff9;border-radius:12px;background:#fff8eaeb;color:#665d49;font-size:11px;line-height:1.7;text-align:center;box-shadow:0 3px 8px #2c30251f}\n.mka-cat-signs{display:flex;justify-content:center;flex-wrap:wrap;gap:5px;margin:8px auto 7px;max-width:100%}.mka-cat-signs>span{padding:4px 9px;border:1px solid #f6eed9c4;border-radius:99px;background:#fffaead9;color:#72694f;font-size:10px;line-height:1.5;box-shadow:0 2px 5px #3b352319}\n.mka-cat-distance{display:flex;align-items:center;justify-content:center;gap:9px;margin:9px auto 3px;padding:6px 12px;width:fit-content;max-width:100%;border-radius:99px;background:#fff8e4d4;color:#726950;font-size:10px}.mka-cat-distance i{width:22px;height:6px;border:1px solid #a6aa8d;border-radius:99px;background:#f1eedc;transition:background .3s,box-shadow .3s}.mka-cat-distance i.is-active{background:#7c916a;border-color:#768d65;box-shadow:0 0 0 2px #c1cba144}\n@keyframes mka-tail-question{to{transform:rotate(12deg)}}\n/* The postcard is an editable paper object, above the coastal scenery. */\n.mka-stage .mka-post-card{position:relative;z-index:2;width:min(100%,365px);margin:10px auto 5px;padding:11px 11px 13px;border:1px solid #c9b38e;border-radius:5px;background:linear-gradient(125deg,#fffcf3,#f1e5ca);box-shadow:0 12px 25px #2d302c45,inset 0 0 0 3px #fff9;transform:rotate(-1deg);transition:background .25s,border-color .25s}\n.mka-post-card:before{content:\"\";position:absolute;top:-7px;left:36%;width:28%;height:17px;border:1px solid #ead6ab4d;background:#d9c9a6a1;transform:rotate(-3deg);box-shadow:0 1px 3px #533f2820;pointer-events:none}\n.mka-post-card[data-frame=blue]{background:linear-gradient(125deg,#edf4f1,#d4e6e0);border-color:#88a69c}.mka-post-card[data-frame=pink]{background:linear-gradient(125deg,#fff3ef,#edcdd0);border-color:#c39ba1}\n.mka-post-card .mka-post-window{position:relative;height:158px;max-width:100%;overflow:hidden;border:1px solid #fff9;border-radius:2px;background-color:#9ebeba;background-size:calc(100% * var(--view-scale,1.2));background-position:var(--view-x,50%) var(--view-y,55%);background-repeat:no-repeat;box-shadow:inset 0 0 18px #253d4226;isolation:isolate;touch-action:none;cursor:grab}\n.mka-post-window:active{cursor:grabbing}.mka-post-window:after{content:\"\";position:absolute;inset:0;z-index:0;background:linear-gradient(130deg,#fff2,transparent 45%,#18323a26);pointer-events:none}.mka-post-window:focus-visible{outline:3px solid #a96570;outline-offset:3px}\n.mka-post-guide{position:absolute;z-index:1;inset:14%;border:1px solid #fff9;background:linear-gradient(90deg,transparent 32.8%,#fff5 33%,transparent 33.4% 66.1%,#fff5 66.5%,transparent 66.9%),linear-gradient(0deg,transparent 32.8%,#fff5 33%,transparent 33.4% 66.1%,#fff5 66.5%,transparent 66.9%);box-shadow:0 0 0 60px #19333912;pointer-events:none}\n.mka-post-title{margin:10px 0 5px;color:#5b6455;font-size:15px;font-weight:600;letter-spacing:.1em;line-height:1.6;text-align:center}.mka-post-message{min-height:27px;margin:7px 0 0;padding:8px 5px 0;border-top:1px solid #bcaa8866;color:#8d7660;font-size:11px;line-height:1.8;overflow-wrap:anywhere}\n.mka-post-stickers{position:absolute;z-index:3;inset:0;pointer-events:none}.mka-post-sticker.mka-button{position:absolute!important;left:var(--x,50%);top:var(--y,50%);display:grid;place-items:center;min-width:44px;min-height:44px;max-width:90px;padding:7px;border:1px solid #fff9;border-radius:5px;background:#fff9eae8;box-shadow:0 3px 6px #27332d33;color:#9f7657;transform:translate(-50%,-50%) rotate(var(--turn,-7deg));cursor:grab;touch-action:none;pointer-events:auto;font-size:11px;line-height:1.4}\n.mka-post-sticker.mka-button:hover:not(:disabled){background:#fffdf5;transform:translate(-50%,-50%) rotate(var(--turn,-7deg)) scale(1.06)}.mka-post-sticker.mka-button:active{cursor:grabbing;box-shadow:0 5px 10px #27332d55}.mka-post-sticker .mka-icon{width:28px;height:28px;stroke-width:1.1}.mka-post-sticker.mka-selected{outline:2px dashed #a66c78;outline-offset:3px;background:#fff7e9;color:#93636b}.mka-post-sticker:focus-visible{outline-offset:4px}\n@media(max-width:520px){.mka-stage.mka-stage-R01,.mka-stage.mka-stage-R02,.mka-stage.mka-stage-R06{min-height:350px;padding:51px 8px 12px}.mka .mka-story{padding:10px 11px;gap:6px}.mka-story p{font-size:11px}.mka .mka-workflow{gap:2px;padding:6px 7px;margin-bottom:10px}.mka-workflow>span{font-size:9px;padding:2px 5px}.mka-stage .mka-yard-board{min-height:224px}.mka-yard-leaf.mka-button{width:48px;height:48px}.mka-yard-trail{left:7px;right:102px;bottom:11px;font-size:9px}.mka-yard-basket{right:7px;width:85px}.mka-stage .mka-cat-scene{min-height:210px}.mka-cat-scene .mka-cat-portrait{height:149px}.mka-cat-caption{font-size:10px}.mka-cat-signs{gap:4px}.mka-cat-signs>span{font-size:9px;padding:4px 7px}.mka-stage .mka-post-card{padding:9px 9px 10px;margin-top:13px}.mka-post-card .mka-post-window{height:145px}.mka-post-title{font-size:13px}.mka-post-message{font-size:10px}.mka-post-sticker.mka-button{max-width:74px;padding:6px;font-size:10px}}\n@media(max-width:350px){.mka-workflow>span{font-size:8px;padding:2px 4px}.mka-yard-arrangement{height:185px}.mka-cat-distance{gap:6px}.mka-post-card .mka-post-window{height:132px}}\n@media(prefers-reduced-motion:reduce){.mka-yard-token,.mka-cat-tail{animation:none!important}.mka-cat-portrait,.mka-cat-distance i{transition:none!important}}\n/* The source portrait already has a painted tail; this marker is an expression accent. */\n.mka-cat-scene .mka-cat-tail{bottom:auto;top:37px;right:21%;width:24px;height:24px;border:0;border-radius:50%;background:radial-gradient(circle,#fff7d2 0 12%,transparent 17%),linear-gradient(90deg,transparent 45%,#f4dfa1 46% 54%,transparent 55%),linear-gradient(0deg,transparent 45%,#f4dfa1 46% 54%,transparent 55%);filter:drop-shadow(0 0 4px #fff6d3);opacity:0;transform:rotate(15deg)}\n.mka-cat-scene[data-mood=curious] .mka-cat-tail,.mka-cat-scene[data-mood=relaxed] .mka-cat-tail{opacity:.85;animation:mka-cat-accent 2.3s ease-in-out infinite alternate}.mka-cat-scene[data-mood=sleepy] .mka-cat-tail{opacity:.7;background:none;transform:none}.mka-cat-scene[data-mood=sleepy] .mka-cat-tail:after{content:\"z\";color:#8b9b88;font:italic 23px/1 serif;text-shadow:0 1px #fff9}\n@keyframes mka-cat-accent{to{opacity:.35;transform:translateY(-4px) rotate(35deg)}}\n/* Final DOM details: portraits beside dialogue, and readable distance choices. */\n.mka-controls>.mka-story{flex:1 0 100%;width:100%;min-width:0;margin:2px 0 8px}\n.mka-duet-row{display:flex;align-items:center;gap:10px;min-width:0}.mka-duet-row>p{flex:1;min-width:0}.mka-duet-portrait{display:block;flex:none;width:43px;height:52px;object-fit:contain;object-position:center bottom;border:1px solid #d2c2a277;border-radius:9px;background:linear-gradient(150deg,#fffaf2,#e6e8d6);filter:drop-shadow(0 2px 2px #33271b12)}.mka-duet-heroine .mka-duet-portrait{background:linear-gradient(150deg,#fffaf2,#f1dfe1)}\n.mka-yard-leaf.mka-button{font-size:0}.mka-stage>.mka-yard-wind{width:fit-content;margin:60px auto 65px;left:auto;top:auto;font-size:12px;padding:12px 17px;line-height:1.9}\n.mka-yard-board[data-side=left] .mka-yard-trail{left:110px;right:10px}\n.mka-cat-art-window{position:relative;width:min(70%,210px);height:170px;overflow:hidden;isolation:isolate;flex:none}\n.mka-cat-scene .mka-cat-art-window>.mka-cat-portrait{position:absolute;left:-100%;top:0;width:300%;max-width:none;height:100%;object-fit:contain;object-position:center 51%;transform-origin:50% 85%}\n.mka-cat-scene[data-mood=watch] .mka-cat-art-window{transform:translateX(17px) scale(.9)}.mka-cat-scene[data-mood=curious] .mka-cat-art-window{transform:translateX(6px)}.mka-cat-scene[data-mood=relaxed] .mka-cat-art-window{transform:scale(1.04)}.mka-cat-scene[data-mood=sleepy] .mka-cat-art-window{transform:translateY(4px) scale(1,.94)}\n.mka-cat-scene[data-mood] .mka-cat-art-window>.mka-cat-portrait{transform:none}.mka-cat-distance{gap:5px;padding:5px;background:#fff7e4d9}.mka-cat-distance i{display:grid;place-items:center;width:auto;min-width:65px;height:auto;min-height:29px;padding:4px 7px;background:#fffbef;color:#8a8167;font:normal 10px/1.5 sans-serif}.mka-cat-distance i.is-active{background:#758c69;color:#fff9e6;border-color:#647e5a;box-shadow:0 2px 5px #32472b26}\n.mka-post-sticker.mka-button.is-active{outline:2px dashed #a66c78;outline-offset:3px;background:#fff7e9;color:#93636b}.mka-post-sticker.mka-button:disabled{opacity:1;cursor:default}\n@media(max-width:520px){.mka-duet-portrait{width:36px;height:45px}.mka-duet-row{gap:7px}.mka-cat-art-window{width:min(73%,200px);height:160px}.mka-cat-distance i{min-width:60px;font-size:9px;padding:4px 6px}.mka-stage>.mka-yard-wind{font-size:11px;padding:10px 12px}}\n@media(prefers-reduced-motion:reduce){.mka-cat-art-window{transition:none!important}}\n\n/* 1.15 · a small Showa-era feeling carried by keepsakes, not a change of setting. */\n.mka-memory-found{margin:10px 0 0;padding:8px 10px;border-radius:8px;background:#f3ead7;color:#8b714e;font-size:11px;letter-spacing:.03em}\n.mka-memory-overlay{position:fixed;inset:0;z-index:2147483601;display:grid;place-items:center;padding:12px;background:#18251dd1;backdrop-filter:blur(6px);overflow:auto}\n.mka-memory-book{width:min(760px,100%);max-height:min(92dvh,940px);overflow:auto;padding:clamp(15px,3vw,27px);border:1px solid #c7b68f;border-radius:17px;background:linear-gradient(145deg,#fffaf0,#f4ecd9);box-shadow:0 25px 80px #11191188,inset 0 0 0 4px #fff7;color:#4b5144;overscroll-behavior:contain}\n.mka-memory-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:12px;border-bottom:1px solid #ded1b2}.mka-memory-title{margin:3px 0 0;color:#52674f;font-size:22px;font-weight:500;letter-spacing:.14em}.mka-memory-intro{margin:13px 0;color:#776f5d;font-size:12px;line-height:1.8}\n.mka-memory-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.mka-memory-card{position:relative;min-height:126px;padding:14px 13px 12px;border:1px dashed #d1c5a6;border-radius:10px;background:linear-gradient(140deg,#faf4e5,#f1e7d1);color:#8b846f}.mka-memory-card.is-collected{border-style:solid;border-color:#c8b58d;background:linear-gradient(140deg,#fffaf0,#f3e9d5);box-shadow:0 3px 9px #46371e12}.mka-memory-number{display:block;color:#a18a64;font:10px/1.4 system-ui,sans-serif;letter-spacing:.12em}.mka-memory-card h4,.mka-memory-episode h4{margin:5px 0 3px;color:#5c654f;font-size:14px;font-weight:600;letter-spacing:.04em}.mka-memory-place{display:block;color:#a48963;font-size:10px}.mka-memory-card p,.mka-memory-episode p{margin:8px 0 0;color:#777365;font-size:11px;line-height:1.75}.mka-memory-card .mka-memory-detail{padding-top:7px;border-top:1px solid #dfd4ba;color:#8c7660;font-size:10px}.mka-memory-placeholder{font-size:18px!important;letter-spacing:.45em;text-align:center}\n.mka-memory-section-title{margin:19px 0 8px;padding-left:10px;border-left:2px solid #b39465;color:#617057;font-size:14px;font-weight:500;letter-spacing:.08em}.mka-memory-episodes{display:grid;gap:8px}.mka-memory-episode{padding:11px 13px;border:1px solid #ddd4bf;border-radius:9px;background:#f6f0e2}.mka-memory-episode.is-unlocked{border-color:#c8b58d;background:#f7efd9;box-shadow:inset 0 0 0 2px #fff8}.mka-memory-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.mka-memory-actions .mka-button{flex:1 1 135px;min-width:120px}.mka-memory-status{margin:8px 0 0;color:#8c836e;font-size:10px;line-height:1.7}.mka-memory-import{display:none}.mka-memory-copy-area{width:100%;min-height:110px;margin-top:8px;border:1px solid #d5c7a8;border-radius:8px;background:#fffdf5;color:#5d5b4e;font:12px/1.6 monospace}\n.mka-marble-course{position:relative;margin:16px auto 8px;padding:14px 13px 12px;max-width:470px;border:1px solid #b99c70;border-radius:13px;background:linear-gradient(145deg,#d5bd91,#b8915f 52%,#9d784f);box-shadow:inset 0 0 0 4px #eddfbf,0 6px 13px #3f2d1e24;color:#554632;overflow:hidden}.mka-marble-course:before{content:\"\";position:absolute;inset:9px;border:1px solid #fff4;border-radius:8px;pointer-events:none}.mka-marble-sign{position:relative;margin:0 auto 9px;width:max-content;max-width:100%;padding:4px 11px;border:1px solid #fff7;border-radius:99px;background:#fff3e0d9;color:#725b3e;font-size:10px;letter-spacing:.12em}\n.mka-marble-track{position:relative;display:flex;justify-content:space-around;align-items:stretch;min-height:139px;padding:4px 8px 8px;border:1px solid #81623e88;border-radius:8px;background:repeating-linear-gradient(0deg,#e8d3a8 0 17px,#dfc698 18px 19px);box-shadow:inset 0 0 0 3px #fff5, inset 0 -9px 16px #80623c20;isolation:isolate}.mka-marble-lane{position:relative;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:flex-start;gap:14px;padding:12px 3px 7px;border-left:2px solid #8a674455;color:#735e40;transition:background .2s,box-shadow .2s}.mka-marble-lane:last-of-type{border-right:2px solid #8a674455}.mka-marble-lane.is-hinted{background:#fff6;box-shadow:inset 0 0 0 2px #fff9}.mka-marble-rail{width:90%;height:10px;border:1px solid #94785088;border-radius:99px;background:linear-gradient(#d0b27f,#f0dfb7);box-shadow:0 2px 2px #4937211b}.mka-marble-cup{display:grid;place-items:center;width:34px;height:34px;border:3px solid #a9814f;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff8e9,#cfb47f 70%);color:#806443;font:9px/1 system-ui,sans-serif;box-shadow:inset 0 -4px 6px #62462222,0 2px 3px #49372125}.mka-marble-lane.is-hinted .mka-marble-cup{background:radial-gradient(circle at 35% 30%,#fffad8,#d6a550 72%);box-shadow:0 0 0 4px #f5e8bd77,0 0 15px #fff2b5}.mka-marble-lane small{font-size:9px;line-height:1.4;text-align:center}.mka-glass-marble{position:absolute;z-index:2;left:50%;bottom:10px;width:25px;height:25px;border:1px solid #effaf0;border-radius:50%;background:radial-gradient(circle at 31% 26%,#fffff4 0 8%,#f8d7b3 11%,#d8787b 25%,#78a99d 47%,#e9d28d 63%,#698ba0 82%);box-shadow:0 3px 5px #3b34294d,inset -3px -4px 7px #183f4e55;transform:translateX(-50%);transition:transform .45s cubic-bezier(.17,.67,.31,1.2)}.mka-glass-marble.is-rolling{transform:translate(115%,-58px) rotate(360deg)}.mka-marble-cue{position:relative;margin:8px 2px 0;color:#fff8e7;font-size:11px;line-height:1.7;text-align:center;text-shadow:0 1px #533d27}\n.mka-marble-course.has-feedback .mka-glass-marble{animation:mka-marble-bounce .45s ease-out}@keyframes mka-marble-bounce{35%{transform:translate(22%,-42px) rotate(150deg)}70%{transform:translate(80%,-19px) rotate(280deg)}}\n@media(max-width:520px){.mka-memory-grid{grid-template-columns:1fr}.mka-memory-book{max-height:calc(100dvh - 16px);padding:14px;border-radius:13px}.mka-memory-card{min-height:105px}.mka-marble-course{padding:12px 8px 10px}.mka-marble-track{min-height:128px;padding-inline:4px}.mka-marble-lane{padding-inline:1px}.mka-marble-lane small{font-size:8px}}\n@media(prefers-reduced-motion:reduce){.mka-marble-course *{animation:none!important;transition:none!important}}\n/* Reuse wardrobe art as cropped upper-body conversation portraits. */\n.mka-duet-avatar{position:relative;display:block;flex:none;width:43px;height:52px;overflow:hidden;border:1px solid #d2c2a277;border-radius:10px;background:linear-gradient(150deg,#fffaf2,#e6e8d6);box-shadow:0 2px 4px #33271b12}.mka-duet-heroine .mka-duet-avatar{background:linear-gradient(150deg,#fffaf2,#f1dfe1)}\n.mka-duet-avatar>.mka-duet-portrait{position:absolute;display:block;left:-65%;top:-4%;width:230%;height:auto;max-width:none;max-height:none;border:0;border-radius:0;background:none!important;object-fit:contain;filter:none}\n.mka-cat-scene[data-mood=cautious] .mka-cat-art-window{transform:translateX(24px) translateY(5px) scale(.87,.91)}.mka-cat-scene[data-mood=cautious] .mka-cat-tail{opacity:0}.mka-cat-art-window{transition:transform .45s ease-out}\n@media(max-width:520px){.mka-duet-avatar{width:38px;height:47px}.mka-duet-avatar>.mka-duet-portrait{width:230%;height:auto}.mka-cat-scene[data-mood=cautious] .mka-cat-art-window{transform:translateX(17px) translateY(5px) scale(.87,.91)}}\n@media(prefers-reduced-motion:reduce){.mka-cat-art-window{transition:none!important}}\n\n:host{all:initial;color:#35463d;font-family:\"Mikage Serif\",-apple-system,BlinkMacSystemFont,\"Noto Sans SC\",sans-serif}\n.mkg-overlay,.mkg-overlay *{box-sizing:border-box}\n.mkg-overlay{position:fixed;inset:0;display:grid;place-items:center;padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));background:radial-gradient(ellipse at 50% 8%,#283a34c7,#151d1bec 68%);backdrop-filter:blur(8px);overflow:auto;opacity:0;animation:mkg-fade-in .18s ease-out forwards}\n.mkg-dialog{position:relative;width:min(940px,100%);max-height:min(940px,calc(100dvh - 24px));overflow:auto;border:1px solid #c7b68f;border-radius:18px;background:#fbf6e8;box-shadow:0 25px 90px #1017118c,inset 0 0 0 4px #f5ecd7;overscroll-behavior:contain;animation:mkg-rise-in .24s cubic-bezier(.2,.7,.25,1) both;scrollbar-color:#c3ad84 transparent;scrollbar-width:thin}\n.mkg-topbar{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:65px;padding:11px clamp(14px,3vw,26px);border-bottom:1px solid #e4dac2;background:#fbf6e8ed;backdrop-filter:blur(12px)}\n.mkg-brand{display:grid;gap:3px;min-width:0}.mkg-eyebrow,.mkg-section-label{font:10px/1.4 system-ui,sans-serif;letter-spacing:.18em;color:#8f8063}.mkg-brand strong{font-size:14px;font-weight:500;letter-spacing:.12em;color:#52654e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.mkg-close{flex:none;width:42px;height:42px;border:1px solid #d6c9a9;border-radius:50%;background:#f6efdd;color:#765c4c;font:26px/1 sans-serif;cursor:pointer}.mkg-close:hover{background:#eee2c7}.mkg-close:focus-visible,.mkg-dialog button:focus-visible{outline:3px solid #b16c75;outline-offset:3px}\n.mkg-intro{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(260px,.88fr);min-height:320px}.mkg-visual{position:relative;min-height:320px;overflow:hidden;background:linear-gradient(145deg,#c3d1bf,#f2e5cb 55%,#859a80);isolation:isolate}.mkg-visual:before,.mkg-visual:after{content:\"\";position:absolute;z-index:1;pointer-events:none}.mkg-visual:before{inset:0;background:linear-gradient(0deg,#1a2924a8,transparent 50%),linear-gradient(110deg,#d4ddd42c,#273e331c)}.mkg-visual:after{width:52%;height:60%;right:-10%;bottom:-16%;border:1px solid #fff8;border-radius:50%;box-shadow:0 0 0 22px #fff2,0 0 0 45px #fff1;opacity:.6}\n.mkg-visual[data-region=\"R01\"]{background:linear-gradient(#e5e0cb 0 37%,#c4d0b8 38% 70%,#aab796)}.mkg-visual[data-region=\"R03\"]{background:radial-gradient(ellipse at 50% 82%,#d5a27e 0 14%,transparent 15%),linear-gradient(135deg,#ead7c3,#e8c9b9 55%,#b6c7ae)}.mkg-visual[data-region=\"R05\"]{background:linear-gradient(0deg,#7f9287 0 17%,#c6c7b4 18% 20%,transparent 21%),linear-gradient(#dae4de,#f1e6d3)}.mkg-visual[data-region=\"R07\"]{background:radial-gradient(ellipse at 18% 40%,#718b6d 0 23%,transparent 24%),radial-gradient(ellipse at 84% 27%,#819577 0 27%,transparent 28%),linear-gradient(#d7e2d3,#e7dfca 62%,#b6c39f)}.mkg-visual[data-region=\"R08\"]{background:radial-gradient(circle at 68% 37%,#fff2bf 0 2px,transparent 4px),radial-gradient(circle at 42% 56%,#ffe7a1 0 2px,transparent 4px),linear-gradient(#46546a,#9aab99 70%,#788c7c)}.mkg-visual[data-region=\"R09\"]{background:radial-gradient(ellipse at 50% 70%,#b27d57 0 25%,transparent 26%),linear-gradient(125deg,#e6d7c3,#d5c3a9 55%,#b3c0a4)}.mkg-visual[data-region=\"R10\"]{background:radial-gradient(circle at 50% 42%,#ffe3a270 0 10%,transparent 42%),linear-gradient(#43495a,#8b806e 68%,#485c4d)}\n.mkg-cover{position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;image-rendering:auto}.mkg-cat{position:absolute;right:7%;bottom:5%;z-index:2;width:min(33%,170px);height:64%;object-fit:contain;filter:drop-shadow(0 8px 5px #30423055)}.mkg-placard{position:absolute;z-index:2;left:20px;bottom:18px;padding:7px 11px;border:1px solid #fff7;background:#24372edb;color:#fff6df;font:10px/1.4 system-ui,sans-serif;letter-spacing:.12em;backdrop-filter:blur(6px)}\n.mkg-copy{display:flex;flex-direction:column;justify-content:center;padding:clamp(22px,4vw,42px);background:linear-gradient(145deg,#fffaf0,#f6efdf)}.mkg-section-label{display:flex;align-items:center;gap:10px}.mkg-section-label:before{content:\"\";width:24px;height:1px;background:#b98c64}.mkg-copy h2{margin:11px 0 12px;color:#475d4a;font-size:clamp(22px,3.3vw,31px);font-weight:500;letter-spacing:.08em;line-height:1.35}.mkg-description{margin:0;color:#6f7163;font-size:14px;line-height:1.9}.mkg-tags{display:grid;gap:7px;margin:18px 0 0;padding:0;list-style:none}.mkg-tags li{position:relative;padding-left:17px;color:#8a785c;font-size:12px;line-height:1.6}.mkg-tags li:before{content:\"✦\";position:absolute;left:0;top:1px;color:#b68762;font-size:11px}\n.mkg-actions{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px clamp(16px,3vw,26px);border-top:1px solid #e3d8bf;background:#f7f0df}.mkg-footnote{margin:0;color:#948a72;font-size:11px;line-height:1.7}.mkg-action-buttons{display:flex;flex:none;gap:9px}.mkg-action-buttons button{min-height:46px;padding:9px 17px;border-radius:10px;font:inherit;cursor:pointer;touch-action:manipulation}.mkg-begin{border:1px solid #536e56;background:#657e60;color:#fffaf0;box-shadow:0 3px 0 #455c48}.mkg-begin:hover{background:#536e56;transform:translateY(-1px)}.mkg-leave{border:1px solid #d4c7a7;background:transparent;color:#786d59}.mkg-leave:hover{background:#eee5d0}\n.mkg-game{padding:clamp(12px,3vw,26px);background:radial-gradient(ellipse at 50% 0,#fffdf6,#f4eddd 72%)}.mkg-game[hidden],.mkg-intro[hidden],.mkg-actions[hidden]{display:none!important}.mkg-game .mka{max-width:790px;padding:clamp(13px,2.8vw,26px);border-radius:16px;background:#fffdf6;box-shadow:0 10px 32px #35433110}.mkg-game .mka-stage{min-height:300px}.mkg-game .mka-result{animation:mkg-stamp-in .28s ease-out both}\n@keyframes mkg-fade-in{to{opacity:1}}@keyframes mkg-rise-in{from{opacity:0;transform:translateY(12px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes mkg-stamp-in{from{opacity:0;transform:scale(.94) rotate(-1deg)}to{opacity:1;transform:scale(1) rotate(0)}}\n@media(max-width:700px){.mkg-intro{grid-template-columns:1fr}.mkg-visual{min-height:clamp(190px,42vw,310px);max-height:34dvh}.mkg-copy{padding:20px 22px}.mkg-tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.mkg-tags li{padding:4px 8px;border:1px solid #e2d8bf;border-radius:999px;background:#fbf6e8}.mkg-tags li:before{content:none}.mkg-actions{align-items:flex-start;flex-direction:column}.mkg-action-buttons{width:100%}.mkg-action-buttons button{flex:1}.mkg-game .mka-stage{min-height:250px}}\n@media(max-width:420px){.mkg-overlay{padding:8px}.mkg-dialog{max-height:calc(100dvh - 16px);border-radius:14px}.mkg-topbar{min-height:56px;padding:8px 12px}.mkg-eyebrow{font-size:9px}.mkg-brand strong{font-size:12px}.mkg-copy{padding:17px}.mkg-copy h2{font-size:22px;margin:7px 0}.mkg-description{font-size:13px}.mkg-actions{padding:12px 14px}.mkg-footnote{font-size:10px}.mkg-game{padding:8px}.mkg-game .mka{padding:12px;border-radius:12px}.mkg-game .mka-stage{min-height:235px}}\n@media(prefers-reduced-motion:reduce){.mkg-overlay,.mkg-dialog,.mkg-game .mka-result{animation:none;opacity:1}.mkg-action-buttons button{transition:none}}\n";
const ART = {"R01": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c/mikage-shrine/assets/activities/r01-courtyard-v1.webp", "R02": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c/mikage-shrine/assets/activities/r02-garden-v1.webp", "R03": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@f616ec7a3587810407df23f4e8e685786306e8f7/mikage-shrine/assets/activities/r03-dango-shop-v1.webp", "R04": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c/mikage-shrine/assets/activities/r04-stream-v1.webp", "R05": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@f616ec7a3587810407df23f4e8e685786306e8f7/mikage-shrine/assets/activities/r05-ticket-station-v1.webp", "R06": {"day": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@8bd6001ee4595c0a4ccadbcab8736308c0c39633/mikage-shrine/assets/regions/time-of-day/r06-day.webp", "dusk": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c/mikage-shrine/assets/activities/r06-coastal-platform-v1.webp", "night": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@8bd6001ee4595c0a4ccadbcab8736308c0c39633/mikage-shrine/assets/regions/time-of-day/r06-night.webp"}, "R07": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@f616ec7a3587810407df23f4e8e685786306e8f7/mikage-shrine/assets/activities/r07-leaf-grove-v1.webp", "R08": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@f616ec7a3587810407df23f4e8e685786306e8f7/mikage-shrine/assets/activities/r08-firefly-marsh-v1.webp", "R09": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@f616ec7a3587810407df23f4e8e685786306e8f7/mikage-shrine/assets/activities/r09-taiko-hall-v1.webp", "R10": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@f616ec7a3587810407df23f4e8e685786306e8f7/mikage-shrine/assets/activities/r10-lantern-path-v1.webp", "cat": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c/mikage-shrine/assets/activities/neighborhood-cat-v1.webp", "tomoe": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@1d45da7c4c4c44837fca70ac7301c06ab762d71a/mikage-shrine/assets/opening/tomoe-v1.webp", "heroine": "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@1d45da7c4c4c44837fca70ac7301c06ab762d71a/mikage-shrine/assets/wardrobe/player-daily.webp"};
const GAME_FONT_URL = "https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@1fc823c65cd9cd6093d9a3eb94b2b99f55e91ecc/mikage-shrine/assets/opening/minigames-v114-glyphs.ttf";
const GAME_FONT_RANGE = "U+4E30,U+4E32,U+4E34,U+4E50,U+4E60,U+4E70,U+4E91-4E92,U+4EAB,U+4EC0,U+4ED8,U+4F20,U+4F38,U+4F4E,U+4FC3,U+508D,U+50AC,U+516D,U+517D,U+51A0,U+51CC,U+51F3,U+51F8,U+521A,U+5269,U+52BF,U+52D9,U+5357,U+538B,U+53C9,U+53CD,U+53E0,U+53E5,U+53EB,U+5404,U+5427,U+5438-5439,U+543B,U+5468,U+5473,U+5494,U+549A,U+54CD,U+5510,U+5584,U+559C,U+55C5,U+55EF,U+56E2,U+5742,U+5782,U+57A3,U+5806,U+5835,U+5854,U+5899,U+58C1,U+5915,U+591F,U+5927,U+592A,U+5934,U+594F,U+5976,U+59FF,U+5BBD,U+5BC4,U+5BCC,U+5BF8,U+5BFC,U+5C16,U+5C3A,U+5C42,U+5CE6,U+5DEE,U+5DF7,U+5E10,U+5E1A,U+5E26,U+5E95,U+5F27,U+5F39,U+5F88,U+5FAE,U+5FD8,U+601D,U+6070,U+60F3,U+6211,U+6218,U+6233,U+6276,U+6298,U+62AC,U+62B1,U+62B9,U+62C6,U+62CD,U+62D3,U+62D6,U+62DB,U+62F1,U+62FC,U+62FE-62FF,U+6302,U+632A,U+633A,U+634F,U+6389,U+63A0,U+63A8,U+6447,U+6478,U+6572,U+6591,U+6597,U+65C1,U+65FA,U+6625,U+6643,U+6652,U+665A,U+6668,U+667E,U+6696,U+671D,U+6735,U+6746,U+674F,U+677E,U+679D,U+67D4,U+67F1,U+6805,U+6841,U+6846,U+6881,U+6905,U+690D,U+693F,U+6B22,U+6B3E,U+6C47,U+6C99,U+6CDB,U+6CE2,U+6CE8,U+6D4B,U+6D82,U+6D88,U+6DA6,U+6DE1,U+6DF1,U+6E0D,U+6EAA,U+6ED1,U+6EE9,U+6F02,U+706B,U+70D8,U+70E4,U+7126,U+7184,U+722A,U+723D,U+724C,U+732B,U+73ED,U+74E3,U+753B,U+7545,U+7566,U+75D5,U+76AE,U+76C6,U+76CF,U+76D6,U+771F,U+772F,U+773C,U+775B,U+77AC,U+7816,U+7834,U+7968,U+79CB,U+7A33,U+7A76,U+7A84,U+7AF9,U+7B14,U+7B3A,U+7B51-7B52,U+7B7E,U+7BEE,U+7C07,U+7C73,U+7C89,U+7CD6,U+7EC3-7EC4,U+7ED5,U+7EF3,U+7EF7,U+7EFF-7F00,U+7F1D,U+7F29,U+7FD8,U+80A1,U+80F6,U+8106,U+8109-810A,U+81C2,U+8207,U+821E-821F,U+822A,U+8239,U+82A6,U+82C7,U+82D4,U+82D7,U+8349,U+8424,U+8568,U+8584,U+85D3,U+8638,U+871C,U+8896,U+88AB,U+8A18,U+8C01,U+8D2F,U+8D34,U+8D6D,U+8D8A,U+8DD1,U+8DDD,U+8E72,U+8F68,U+8F85,U+904D,U+907F,U+90A3,U+90AE,U+9192,U+91C7,U+9262,U+9332,U+949F,U+94AE,U+955C,U+95EA,U+95EF,U+95FB,U+9633-9635,U+9650,U+966A,U+9699,U+971C,U+9760,U+987A,U+9897,U+989C,U+98D8,U+9988,U+9999,U+9A73,U+9AD8,U+9CE5,U+9E25,U+9F13,U+9F20";

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
    R03:['dango','串起一签春色','搭配三颗团子、逐颗调好火候，再选蘸料与点缀；也可以和巴卫加玩三局玻璃弹珠。','春日手作','按喜欢的顺序搭配团子，观察火候烤出金边，再配上蘸料与最后点缀。'],
    R04:['boat','让纸舟顺水走','先决定船形与纸色，再观察水流，给小舟选一条合适的路线。没有时间限制。','纸舟顺流','为纸舟选好船形，在不同水势间调整航线，让它沿溪漂远。'],
    R05:['ticket','等车时的一枚票根','挑定目的方向，串起两处停靠站，再逐站盖印，排成一段完整的小旅行。','站前旅票','从站前出发，按顺序安排两处停靠与终点，再为每一站盖上不同纪念印。'],
    R06:['tram','海风寄来的明信片','与巴卫在候车区共同取景，亲手排版装饰，再选一句你想对他说的话。','海风邮戳','从临海电车站台拍下一张构图与装饰都由自己选择的明信片。'],
    R07:['fern','收集一页叶拓','沿着脚印、树皮或落叶找到三种叶片，再在拓纸上亲手来回压印。','草木叶拓','循着林间线索找到三种叶片，在拓纸上慢慢压出带颜色的叶脉。'],
    R08:['firefly','跟着微光呼吸','选择听芦苇还是看水面，记住两段逐渐变长的萤火顺序；可以随时重看。','微光同行','循着自己选择的线索，记住两段萤火顺序，在夜色里慢慢跟上。'],
    R09:['drum','神乐前的三拍练习','选择稳拍或轻快合拍，跟着三段逐渐变化的四拍节奏敲鼓；也能自由合奏。','太鼓三拍','选好节奏后跟上三段四拍节奏，敲出属于今晚的合奏。'],
    R10:['lantern','把归途慢慢点亮','先挑灯路和灯色，再逐盏点亮，可以随时改动摆放前的配色。','灯下归途','选好灯路与灯色，点亮六盏纸灯，为归途留下一片温柔的光。'],
  };
  const MEMORY_STORAGE_KEY = 'mikage.showa-memory-book.v1';
  const MEMORY_ITEMS = [
    {id:'R01',region:'R01',place:'御影神社',item:'银杏叶压签',line:'扫帚声停下来后，叶脉像旧日历上的细线一样清楚。'},
    {id:'R02',region:'R02',place:'坂道住宅区',item:'猫牌铜铃',line:'铜铃轻轻响了一声，小猫选在离你们不远的地方坐下。'},
    {id:'R03-DANGO',region:'R03',place:'团子小店',item:'团子纸签',line:'纸签沾着一点黄豆粉，背面记下了今天的配方。'},
    {id:'R03-MARBLES',region:'R03',place:'团子小店',item:'玻璃弹珠',line:'弹珠里映出窗格、灯光，还有你们并排的影子。'},
    {id:'R04',region:'R04',place:'清溪石桥',item:'折纸船',line:'溪水把小船送到石桥下，折角仍然完好。'},
    {id:'R05',region:'R05',place:'临海车站',item:'打孔车票',line:'三枚小孔串起了你们慢慢走过的三站。'},
    {id:'R06',region:'R06',place:'海边电车站',item:'海风明信片',line:'卡片背面留着一段没有寄出的对话。'},
    {id:'R07',region:'R07',place:'林间木道',item:'叶脉书签',line:'压进纸里的叶脉，隔天仍留着清晰的纹路。'},
    {id:'R08',region:'R08',place:'芦苇栈道',item:'夜光玻璃珠',line:'芦苇间的小光停在水面，只有安静下来才看得清。'},
    {id:'R09',region:'R09',place:'神乐会所',item:'太鼓节拍签',line:'同一段节拍，被两个人敲成了一支合奏。'},
    {id:'R10',region:'R10',place:'灯火参道',item:'纸灯小票',line:'六盏灯排出一条可以慢慢走回家的路。'},
  ];
  const MEMORY_EPISODES = [
    {at:3,title:'傍晚的糖纸',text:'老店主把一叠旧糖纸摊在桌上。几种折痕看似随意，却总朝着同一条放学路。巴卫替你把纸角压平，嘴上嫌弃纸太薄，手却没有松开。'},
    {at:7,title:'末班电车前',text:'旧票根的孔洞和明信片上的海岸线拼出一段约定：几个孩子总在末班车前，把没说完的话写在背面。巴卫没有把自己说成其中一员，只将靠窗的位置留给你。'},
    {at:11,title:'灯火收摊后',text:'摊主记得的不是最热闹的一年，而是散场时有人把最后一盏纸灯送回店里。巴卫轻声说，记住一件小事，比记住一整段年月容易。你们合上旧物册，也留下一页新的空白。'},
  ];
  let volatileMemoryBook = {schema:1,entries:{}};
  function readMemoryBook(){
    const entries={...(volatileMemoryBook.entries||{})};
    try{const raw=global.localStorage?.getItem(MEMORY_STORAGE_KEY);if(raw){const parsed=JSON.parse(raw);if(parsed?.schema===1&&parsed.entries&&typeof parsed.entries==='object')Object.assign(entries,parsed.entries);}}
    catch{}
    return {schema:1,entries};
  }
  function writeMemoryBook(book){
    volatileMemoryBook={schema:1,entries:{...(book.entries||{})}};
    try{global.localStorage?.setItem(MEMORY_STORAGE_KEY,JSON.stringify(volatileMemoryBook));return true;}
    catch{return false;}
  }
  function saveMemories(region,detail,ids){
    const book=readMemoryBook(),now=new Date().toISOString(),saved=[];
    for(const id of ids){
      const meta=MEMORY_ITEMS.find(item=>item.id===id);if(!meta)continue;
      const previous=book.entries[id];
      const entry={id,region:meta.region,place:meta.place,item:meta.item,line:meta.line,detail:String(detail||'').slice(0,320),firstSeen:previous?.firstSeen||now,lastSeen:now,plays:(Number(previous?.plays)||0)+1};
      book.entries[id]=entry;saved.push({...entry,newlyAdded:!previous});
    }
    writeMemoryBook(book);
    return saved;
  }
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
    let bookButton;
    function showMemoryBook(){
      const book=readMemoryBook(),known=new Set(Object.keys(book.entries).filter(id=>MEMORY_ITEMS.some(item=>item.id===id))),count=known.size;
      const overlay=el('div','mka-memory-overlay');overlay.setAttribute('role','presentation');
      const panel=el('section','mka-memory-book');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','旧物回忆册');
      const header=el('header','mka-memory-header'),heading=el('div','');heading.append(el('span','mka-kicker','MIKAGE · AFTER SCHOOL'),el('h3','mka-memory-title','旧物回忆册'));
      const close=el('button','mka-button mka-quiet','合上回忆册');close.type='button';close.addEventListener('click',()=>{overlay.remove();bookButton?.focus({preventScroll:true});});header.append(heading,close);panel.append(header);
      panel.append(el('p','mka-memory-intro',`在街角旧物摊和十处散策里，一点点收好小镇的旧日回声。已收录 ${count}/${MEMORY_ITEMS.length} 件；重复游玩会更新记录，不会重复计数。`));
      const grid=el('div','mka-memory-grid');
      MEMORY_ITEMS.forEach((item,index)=>{
        const record=book.entries[item.id],card=el('article',`mka-memory-card${record?' is-collected':''}`);card.dataset.memoryId=item.id;
        card.append(el('span','mka-memory-number',String(index+1).padStart(2,'0')),el('h4','',record?item.item:'尚未拾到'),el('span','mka-memory-place',record?item.place:'散策后会在这里留下印记'));
        if(record){card.append(el('p','',item.line));if(record.detail)card.append(el('p','mka-memory-detail',`那天：${record.detail}`));}
        else card.append(el('p','mka-memory-placeholder','···'));
        grid.append(card);
      });
      panel.append(grid,el('h4','mka-memory-section-title','回忆短篇'));
      const episodes=el('div','mka-memory-episodes');
      MEMORY_EPISODES.forEach(episode=>{const unlocked=count>=episode.at,row=el('article',`mka-memory-episode${unlocked?' is-unlocked':''}`);row.append(el('span','mka-memory-number',unlocked?'已解锁':`再收 ${episode.at-count} 件`),el('h4','',episode.title),el('p','',unlocked?episode.text:'散策手帖里的小物件会慢慢拼出这段故事。'));episodes.append(row);});
      panel.append(episodes);
      const actions=el('div','mka-memory-actions'),status=el('p','mka-memory-status','仅保存在本设备当前浏览器，不调用模型；可以导出备份后换设备继续。');
      button('导出备份',()=>{try{const payload={schema:1,exportedAt:new Date().toISOString(),entries:readMemoryBook().entries},blob=new global.Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=global.URL.createObjectURL(blob),link=el('a');link.href=url;link.download='御影神社_旧物回忆册.json';link.click();global.setTimeout(()=>global.URL.revokeObjectURL(url),1000);status.textContent='回忆册备份已开始下载。';}catch{status.textContent='当前浏览器暂不支持下载备份。';}},'mka-quiet',actions);
      button('复制已收录摘要',async()=>{const lines=MEMORY_ITEMS.filter(item=>known.has(item.id)).map(item=>{const record=book.entries[item.id];return `- ${item.item}（${item.place}）：${item.line}${record?.detail?`\n  ${record.detail}`:''}`;});const summary=`【御影神社·旧物回忆册 ${count}/${MEMORY_ITEMS.length}】\n${lines.join('\n')||'还没有收录旧物。'}`;try{await global.navigator?.clipboard?.writeText(summary);status.textContent='摘要已复制；粘贴到对话里，巴卫就能接着回忆。';}catch{const area=el('textarea','mka-memory-copy-area');area.value=summary;panel.append(area);area.focus();area.select();let copied=false;try{copied=!!document.execCommand('copy');}catch{}area.remove();status.textContent=copied?'摘要已复制；粘贴到对话里，巴卫就能接着回忆。':'复制受限，可以用导出备份保存。';}},'mka-quiet',actions);
      const input=el('input','mka-memory-import');input.type='file';input.accept='application/json,.json';input.hidden=true;input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;if(file.size>500000){status.textContent='备份文件过大，未导入。';return;}try{const parsed=JSON.parse(await file.text()),incoming=parsed?.entries;if(!incoming||typeof incoming!=='object')throw new Error('invalid');const merged=readMemoryBook();for(const item of MEMORY_ITEMS){const record=incoming[item.id];if(record&&record.id===item.id)merged.entries[item.id]={...merged.entries[item.id],...record,region:item.region,item:item.item,line:item.line,detail:String(record.detail||'').slice(0,320)};}writeMemoryBook(merged);overlay.remove();showMemoryBook();}catch{status.textContent='没有识别到有效的御影神社回忆册备份。';}});
      button('导入备份',()=>input.click(),'mka-quiet',actions);actions.append(input);panel.append(actions,status);overlay.append(panel);
      overlay.addEventListener('click',event=>{if(event.target===overlay){overlay.remove();bookButton?.focus({preventScroll:true});}});root.append(overlay);close.focus({preventScroll:true});
    }
    const replay=button('再玩一次',reset,'mka-quiet',footer);replay.prepend(icon('retry'));
    bookButton=button('旧物回忆册',showMemoryBook,'mka-quiet',footer);bookButton.prepend(icon('seal'));
    const close=button('收起小舞台',()=>{if(typeof opts.onClose==='function')opts.onClose();},'mka-quiet',footer);close.prepend(icon('close'));
    root.append(heading,help,stage,progress,controls,result,footer);container.append(root);
    function say(text){progress.textContent=text;}
    function clear(){stage.replaceChildren();controls.replaceChildren();}
    function later(fn,ms){const t=setTimeout(()=>{timers.delete(t);if(!disposed)fn();},ms);timers.add(t);}
    function cancelTimers(){timers.forEach(clearTimeout);timers.clear();}
    function assetUrl(assetKey){const source=assetKey&&opts.art?.[assetKey];const url=typeof source==='string'?source:(source?.[opts.period]||source?.default);return typeof url==='string'&&/^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(url)?url:null;}
    function finish(detail, extra){
      if(completed||disposed)return;completed=true;
      const memoryIds=Array.isArray(extra?.memoryIds)?extra.memoryIds:[region==='R03'?'R03-DANGO':region];
      const memories=saveMemories(region,detail||meta[4],memoryIds);
      result.hidden=false;result.replaceChildren(icon('seal'),el('div','',`小事完成 · ${meta[3]}`),el('p','',detail||meta[4]));
      const newlyAdded=memories.filter(item=>item.newlyAdded);
      result.append(el('p','mka-memory-found',newlyAdded.length?`回忆册新添：${newlyAdded.map(item=>item.item).join('、')}`:'回忆册已收好这件小物，今天的记录也更新了。'));
      say('这一刻已经收好。也可以再玩一次，换一种搭配。');
      if(typeof opts.onComplete==='function')opts.onComplete({region,title:meta[1],detail:detail||meta[4],stamp:meta[3],...(extra||{}),memories});
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
      const active=root.getRootNode()?.activeElement||document.activeElement;
      const restoreFocus=!!active&&root.contains(active);
      const activeLabel=restoreFocus?active.getAttribute('aria-label'):null;
      clear();handlers[region]();
      if(restoreFocus){
        const available=Array.from(root.querySelectorAll('button')).filter(b=>!b.disabled);
        const matching=activeLabel?available.find(b=>b.getAttribute('aria-label')===activeLabel):null;
        const target=matching||stage.querySelector('button:not(:disabled)')||controls.querySelector('button:not(:disabled)')||available[0];
        target?.focus({preventScroll:true});
      }
    }
    function workflow(labels){
      const n=el('div','mka-workflow');labels.forEach((label,i)=>n.append(el('span',i===state.step?'is-current':i<state.step?'is-done':'',`${i+1} · ${label}`)));stage.append(n);
    }
    function story(tomoe,player){
      const n=el('div','mka-story mka-duet');
      [['tomoe','巴卫',tomoe],['heroine','你',player]].forEach(([key,name,line])=>{if(!line)return;const row=el('div',`mka-duet-row mka-duet-${key}`);const url=assetUrl(key);if(url){const img=el('img','mka-duet-portrait');img.alt='';img.setAttribute('aria-hidden','true');img.src=url;const avatar=el('span','mka-duet-avatar');avatar.append(img);img.addEventListener('error',()=>avatar.remove(),{once:true});row.append(avatar);}row.append(el('p',key==='tomoe'?'mka-story-tomoe':'mka-story-player',`${name}：${line}`));n.append(row);});controls.append(n);
      state.companion={tomoe,player:player||''};
    }
    function finishMoment(detail,choices){finish(detail,{activityVersion:3,choices,companion:state.companion});}
    const handlers={
      R01(){
        scenery('courtyard','R01');workflow(['听风','合力扫叶','安排秋色','收好这一刻']);
        const wind={east:{name:'东风',arrow:'←',hint:'叶尖都指向左边，左侧背风处能拢住落叶。',side:'left'},west:{name:'西风',arrow:'→',hint:'叶片正向右边滑动，右侧石灯后是背风处。',side:'right'}};
        state.wind ||= generation%2===1?'east':'west';const breeze=wind[state.wind];
        const positions=[[14,23,-24],[39,18,28],[70,28,-8],[27,57,49],[58,62,-30],[83,56,15]];
        state.swept ||= [];state.layout ||= 'clear';
        if(state.step===0){
          sceneCaption('先看叶尖的方向，再请巴卫把竹篮放到背风处。');
          const cue=el('div','mka-yard-wind',`${breeze.arrow} ${breeze.name} · ${breeze.hint}`);stage.append(cue);
          story('先别急着追着叶子跑。看看风往哪边吹，你来指路，我拿篮子。');
          say(state.feedback||'观察风向，选择竹篮的位置。选错可以重新放。');
          [['left','请巴卫把竹篮放在左侧'],['right','请巴卫把竹篮放在右侧']].forEach(([side,label])=>button(label,()=>{if(side!==breeze.side){state.feedback='一阵风把叶子吹出了篮边。巴卫提起篮子，等你重新选个背风处。';render();return;}state.step=1;state.feedback='';render();}));return;
        }
        if(state.step===1){
          sceneCaption('按住落叶，顺着风拖到竹篮；也能逐片收拢。');
          const board=el('div','mka-yard-board');board.style.touchAction='pan-y';board.dataset.side=breeze.side;
          board.append(el('div','mka-yard-wind',`${breeze.arrow} ${breeze.name} · 巴卫稳稳扶着竹篮`));
          const basket=el('div','mka-yard-basket',`竹篮 ${state.swept.length}/6`);basket.style.left=breeze.side==='left'?'3%':'77%';basket.style.right='auto';basket.style.width='20%';board.append(basket);
          const gather=i=>{if(state.swept.includes(i)||completed)return;state.swept.push(i);state.feedback=state.swept.length===3?'巴卫把最后几片叶子拢到你面前：「慢慢来，石阶已经露出来了。」':'';render();};
          positions.forEach(([x,y,r],i)=>{if(state.swept.includes(i))return;
            const leaf=button(`收拢第${i+1}片落叶`,()=>gather(i),'mka-yard-leaf',board);leaf.replaceChildren(icon(i%2?'ginkgo':'leaf'));leaf.style.cssText=`--x:${x}%;--y:${y}%;--turn:${r}deg;left:${x}%;top:${y}%;touch-action:none`;
            let dragging=false,moved=false,suppress=false;let startX=0,startY=0;
            leaf.addEventListener('pointerdown',event=>{dragging=true;moved=false;startX=event.clientX;startY=event.clientY;leaf.setPointerCapture(event.pointerId);});
            leaf.addEventListener('pointermove',event=>{if(!dragging)return;const rect=board.getBoundingClientRect();if(Math.hypot(event.clientX-startX,event.clientY-startY)>5)moved=true;if(!moved)return;leaf.style.left=`${Math.max(0,Math.min(95,(event.clientX-rect.left)/rect.width*100))}%`;leaf.style.top=`${Math.max(0,Math.min(85,(event.clientY-rect.top)/rect.height*100))}%`;});
            leaf.addEventListener('pointerup',event=>{if(!dragging)return;dragging=false;if(!moved)return;suppress=true;const rect=basket.getBoundingClientRect();if(event.clientX>=rect.left-24&&event.clientX<=rect.right+24&&event.clientY>=rect.top-24&&event.clientY<=rect.bottom+24)gather(i);else{leaf.style.left=`${x}%`;leaf.style.top=`${y}%`;say('叶子还没进篮，再顺着风拖一次；也可以用下方按钮。');}later(()=>{suppress=false;},0);});
            leaf.addEventListener('click',event=>{if(suppress||moved){event.stopImmediatePropagation();event.preventDefault();}},true);
            leaf.addEventListener('pointercancel',()=>{dragging=false;moved=false;leaf.style.left=`${x}%`;leaf.style.top=`${y}%`;});
          });stage.append(board);
          story(state.feedback||'你扫过来，我接着。别把参道边的小草也扫进去了。');
          say(`已经合力收好 ${state.swept.length}/6 片。拖进篮子或点击叶片，下方也有等效按钮。`);
          const next=positions.findIndex((_,i)=>!state.swept.includes(i));if(next>=0)button('顺风收拢下一片',()=>gather(next));else button('一起安排庭院秋色',()=>{state.step=2;render();});return;
        }
        const layouts={clear:{label:'石阶留白',line:'把石阶扫干净，树下留一小堆吧。',tomoe:'参拜的人走得稳，树根也有落叶护着。你想得倒周全。'},heart:{label:'树下心形',line:'树下拼个小小的心形，你帮我扶住这一边。',tomoe:'这么讲究……好，左边我来。风吹散之前，先陪你看一会儿。'},ring:{label:'围树秋环',line:'围着树根铺一圈，把参道留出来。',tomoe:'好。叶子围着树，人走石阶，谁也不挡谁的路。'}};
        const layout=layouts[state.layout];const art=el('div','mka-yard-arrangement');art.dataset.layout=state.layout;
        positions.forEach(([x,y,r],i)=>{const n=el('span','mka-yard-token');n.append(icon(i%2?'ginkgo':'leaf'));let px=x,py=y;if(state.layout==='heart'){px=[32,43,55,66,42,56][i];py=[35,29,29,35,50,50][i];}else if(state.layout==='ring'){px=50+25*Math.cos(i*Math.PI/3);py=45+22*Math.sin(i*Math.PI/3);}else{px=20+i*11;py=65+(i%2)*8;}n.style.cssText=`--x:${px}%;--y:${py}%;--turn:${r}deg;left:${px}%;top:${py}%`;art.append(n);});stage.append(art);
        if(state.step===2){sceneCaption('参道保持通畅，树下的秋色由你安排。');story('石阶已经干净了。剩下这些叶子，想怎么摆？');say('三种安排都能完成；预览后可随时换一种。');Object.entries(layouts).forEach(([key,item])=>choice(item.label,()=>{state.layout=key;render();},key===state.layout));button('就这样，和巴卫一起摆好',()=>{state.step=3;render();finishMoment(`与巴卫听${breeze.name}、合力收好六片落叶，在不挡参道的树下布置「${layout.label}」。你说：「${layout.line}」巴卫回应：「${layout.tomoe}」`,{wind:state.wind,layout:state.layout});});return;}
        sceneCaption(`庭院已布置 · ${layout.label}`);story(layout.tomoe,layout.line);say('石阶清爽，树下留着你们一起摆好的秋色。');
      },
      R02(){
        scenery('garden','R02');workflow(['观察姿态','留出距离','等待回应','共同记忆']);
        state.distance ??= 2;const mood=state.feedback?'cautious':state.step===0?'watch':state.step<3?'curious':state.catEnding==='nap'?'sleepy':'relaxed';
        const cat=el('div','mka-cat-scene');cat.dataset.mood=mood;
        const url=assetUrl('cat');if(url){const img=el('img','mka-cat-portrait');img.src=url;img.alt='花盆边的小猫';img.addEventListener('error',()=>img.replaceWith(icon('cat')),{once:true});const window=el('div','mka-cat-art-window');window.append(img);cat.append(window);}else cat.append(icon('cat','mka-cat-portrait'));
        cat.append(el('span','mka-cat-tail'),el('p','mka-cat-caption',state.feedback?'它缩在花盆边，身体压低，先给它多一点空间。':state.step===0?'耳朵朝向你，尾巴贴着爪边，还没有主动靠近。':state.step<3?'它嗅了嗅空气，耳朵转向你们，仍站在自己的位置。':state.catEnding==='nap'?'它把尾巴绕住爪子，安静地望着你们。':state.catEnding==='play'?'它伸出爪子拨了一下玩具，又抬头看看你们。':'它自己走近半步，轻轻闻了闻你停住的手。'));stage.append(cat);
        const signs=el('div','mka-cat-signs');(state.feedback?['身体压低：有些紧张','停下动作，留出退路','重新拉开距离']:state.step>=3?['身体放松：可以安心停留','猫自己选择了回应','慢慢结束，不强行抱起']:['耳朵朝向你：还在观察','尾巴收在身边：暂未靠近','让猫决定是否靠近']).forEach(text=>signs.append(el('span','',text)));stage.append(signs);
        if(state.step===0){story('它还在看我们。先蹲下来，别堵着花盆旁的出口。你觉得它现在想怎样？');say(state.feedback||'观察姿态，选择下一步。这里没有必须摸到猫的目标。');button('它还在观察，我们先留出空间',()=>{state.step=1;state.feedback='';render();});button('我想先伸手摸摸它',()=>{state.feedback='猫把身体往花盆后缩了一点。巴卫放低声音：「先把手收回来，让它看清楚。」可以重新观察。';render();});return;}
        if(state.step===1){
          const distance=el('div','mka-cat-distance');['一臂以内','一臂之外','两步之外'].forEach((label,i)=>{const n=el('i',state.distance===i?'is-active':'');n.textContent=label;distance.append(n);});stage.append(distance);
          story('我替你挡着路过的人。距离由你决定，让它随时能走开。');say(state.feedback||'挑一个距离和招呼方式，再看看它自己的回应。');
          ['一臂以内','一臂之外','两步之外'].forEach((label,i)=>choice(label,()=>{state.distance=i;render();},state.distance===i));
          [['toy','把玩具放在它够得到的地方'],['quiet','侧身坐下，移开视线'],['hand','把手停住，让它自己来闻']].forEach(([key,label])=>button(label,()=>{if(state.distance===0){state.feedback='这个位置让它有些紧张。你与巴卫一起退开，重新选一个更宽松的距离。';state.distance=1;render();return;}state.approach=key;state.step=2;state.feedback='';render();}));return;
        }
        if(state.step===2){
          story(state.approach==='toy'?'玩具放稳了，别往它身上晃。它想玩时自然会过来。':state.approach==='hand'?'手就停在那里。它不靠近也没关系，我陪你等。':'这会儿安静些也好。它看起来没那么绷着了。');say('你来选怎样结束这次相处。每种结果都会留下不同的记忆。');
          [['play','请巴卫轻轻挪动玩具，我留出退路'],['sniff','我把手放低，等它闻一闻'],['nap','和巴卫安静坐着，让猫休息']].forEach(([key,label])=>button(label,()=>{state.catEnding=key;state.step=3;render();const endings={play:'你留出退路，巴卫把玩具轻轻挪开半寸。猫自己拨动了玩具，你与巴卫一起等它的下一次动作。',sniff:'你把手停在低处，巴卫安静守在一旁。猫自己靠近闻了闻，你没有继续伸手催它。',nap:'你与巴卫侧身安静坐着，猫在花盆边放松地坐着。巴卫也放轻了整理衣袖的动作。'};finishMoment(endings[key],{distance:state.distance,approach:state.approach,ending:key});}));return;
        }
        const lines={play:['看吧，它玩得挺认真。我再把玩具轻轻挪开一点。','我留出退路，你轻轻挪动玩具。'],sniff:['嗯，它记住这股气味了。今天就到这里也很好。','我把手放低，等它自己来闻。'],nap:['我也坐这里。让它安心休息一会儿。','我们安静坐着，让它休息吧。']};story(...lines[state.catEnding]);say('猫按自己的节奏回应，你和巴卫一起收好这段相处。');
      },
      R03(){
        scenery('dango','R03');
        sceneCaption(['捏制三颗团子','看香气调火候 · 不限时','选蘸料与最后点缀','弹珠加赛 · 不限时','春日小签已完成'][state.step]||'串起一签春色');
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
          const detail=`按${state.selected.map(i=>palette[i][0]).join('、')}的顺序串成三颗团子，逐颗观察火候烤出金边，再配上${sauceLabel||'喜欢的蘸料'}与${toppingLabel||'点缀'}。`;
          const done=button('盖印收好这一签',()=>{state.step=4;render();finish(detail,{memoryIds:['R03-DANGO']});});
          done.disabled=!state.sauce||!state.garnish;
          const marbles=button('加玩三局玻璃弹珠',()=>{state.step=3;state.marbleRound=0;state.marbleLane='';state.marblePower='';state.marbleRoute=[];state.marbleFeedback='';state.marbleHint=false;render();},'mka-quiet');
          marbles.disabled=!state.sauce||!state.garnish;
          return;
        }

        if(state.step===3){
          const rounds=[
            {lane:'left',power:'soft',cue:'第一局：木沿留着一道浅浅的擦痕，弹珠可以贴着左边慢慢回弹。',hint:'贴左侧木沿，轻轻推。',line:'巴卫把玻璃珠放回起点：“先别急着用力，听它滚到哪儿。”'},
            {lane:'right',power:'steady',cue:'第二局：右侧挡片的弧度更圆，弹珠要绕过去再稳稳回来。',hint:'绕右侧挡片，稳稳推。',line:'他用指节敲了敲木框：“这次走外圈，手腕放松。”'},
            {lane:'center',power:'firm',cue:'最后一局：奖品碟在正中，前面两块挡片之间留着一条窄道。',hint:'从中间穿过，稍微用力。',line:'巴卫看了眼正中的玻璃碟：“最后一颗，给它一点劲就够了。”'},
          ];
          const round=rounds[state.marbleRound];
          if(!round){state.step=4;render();return;}
          const lanes=[['left','贴左木沿'],['center','穿过中间'],['right','绕过右挡片']],powers=[['soft','轻推'],['steady','稳推'],['firm','稍用力']];
          workflow(['看木沿','选路线','调力道','弹进玻璃碟']);
          const board=el('div',`mka-marble-course${state.marbleFeedback?' has-feedback':''}`);board.dataset.turn=String(state.marbleRound+1);
          board.append(el('div','mka-marble-sign',`旧货摊 · 第 ${state.marbleRound+1}/3 局`));
          const track=el('div','mka-marble-track');
          lanes.forEach(([key,label],index)=>{const lane=el('div',`mka-marble-lane lane-${key}${state.marbleHint&&key===round.lane?' is-hinted':''}`);lane.append(el('span','mka-marble-rail'),el('span','mka-marble-cup',state.marbleHint&&key===round.lane?'目标':'○'),el('small','',label));track.append(lane);if(index===1){const marble=el('span',`mka-glass-marble${state.marbleFeedback?' is-rolling':''}`);marble.setAttribute('aria-hidden','true');track.append(marble);}});
          board.append(track,el('div','mka-marble-cue',round.cue));stage.append(board);
          story(round.line,state.marbleFeedback||'我来选路线和力道。弹偏了也能再来。');
          say(state.marbleFeedback||'按木沿线索选一条路线和力道。不限时；可以请巴卫提示，也能反复尝试。');
          lanes.forEach(([key,label])=>choice(label,()=>{state.marbleLane=key;render();},state.marbleLane===key));
          powers.forEach(([key,label])=>choice(label,()=>{state.marblePower=key;render();},state.marblePower===key));
          const hint=button(state.marbleHint?'巴卫已经提示过':'请巴卫看一眼木沿',()=>{state.marbleHint=true;state.marbleFeedback=`巴卫低声说：「${round.hint}」`;render();},'mka-quiet');hint.disabled=state.marbleHint;
          const launch=button('弹出玻璃珠',()=>{
            if(!state.marbleLane||!state.marblePower){say('先选路线和力道，再弹出玻璃珠。');return;}
            if(state.marbleLane===round.lane&&state.marblePower===round.power){
              state.marbleRoute.push(`${lanes.find(x=>x[0]===state.marbleLane)[1]} · ${powers.find(x=>x[0]===state.marblePower)[1]}`);
              state.marbleRound++;state.marbleLane='';state.marblePower='';state.marbleHint=false;
              state.marbleFeedback=state.marbleRound===3?'玻璃珠叮地落进碟里，老板把它递给你们：“这一颗，留着当纪念吧。”':'弹珠沿木沿转了一圈，正好落进玻璃碟。巴卫把下一颗推到你手边。';
              if(state.marbleRound===3){const finalDetail=`${detail}之后，你和巴卫在旧货摊玩了三局弹珠，依次选择${state.marbleRoute.join('、')}，最后把一颗映着店灯的玻璃珠收进小册。`;state.step=4;render();finish(finalDetail,{memoryIds:['R03-DANGO','R03-MARBLES'],marbleRoute:state.marbleRoute.slice()});return;}
              render();return;
            }
            state.marbleAttempts=(state.marbleAttempts||0)+1;
            state.marbleFeedback=state.marbleLane!==round.lane?'弹珠碰到挡片，绕回起点。巴卫替你捡起来：“路线再看一眼，不赶时间。”':'弹珠沿对了木沿，却停在碟子边。巴卫把它滚回起点：“力道换一档试试。”';
            state.marbleLane='';state.marblePower='';render();
          });
          launch.disabled=!state.marbleLane||!state.marblePower;
          button('跳过加赛，收好团子',()=>{state.step=4;render();finish(detail,{memoryIds:['R03-DANGO']});},'mka-quiet');
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
        const periodLabel={day:'白昼',dusk:'黄昏',night:'夜色'}[opts.period]||'白昼';
        scenery('coast-platform','R06');workflow(['共同取景','装饰排版','选择寄语','成品预览']);
        state.view ||= 'sea';state.frame ||= 'cream';state.panX ??= 50;state.panY ??= 50;state.zoom ??= 1;state.stickers ||= [];state.note ||= '';
        const themes={sea:'海风与远方',tram:'站台与旅途',lighthouse:'灯塔与归路'},frames={cream:'奶油纸边',blue:'海蓝胶片',pink:'樱粉纸边'};
        const marks={seal:['seal','今日邮戳'],tram:['tram','小电车'],heart:['heart','一颗心意'],leaf:['leaf','叶片书签']};
        const card=el('div','mka-post-card');card.dataset.frame=state.frame;card.dataset.theme=state.view;
        const photo=el('div','mka-post-window');const photoUrl=assetUrl('R06');if(photoUrl)photo.style.backgroundImage=`url(${JSON.stringify(photoUrl)})`;photo.style.backgroundPosition=`${state.panX}% ${state.panY}%`;photo.style.backgroundSize=`${state.zoom*150}% auto`;photo.style.setProperty('--view-x',`${state.panX}%`);photo.style.setProperty('--view-y',`${state.panY}%`);photo.style.setProperty('--view-scale',state.zoom);
        if(state.step===0){const guide=el('span','mka-post-guide');guide.setAttribute('aria-hidden','true');photo.append(guide);
          let dragging=false,lastX=0,lastY=0;photo.style.touchAction='none';
          photo.addEventListener('pointerdown',event=>{dragging=true;lastX=event.clientX;lastY=event.clientY;photo.setPointerCapture(event.pointerId);});
          photo.addEventListener('pointermove',event=>{if(!dragging)return;const rect=photo.getBoundingClientRect();state.panX=Math.max(0,Math.min(100,state.panX-(event.clientX-lastX)/rect.width*140));state.panY=Math.max(0,Math.min(100,state.panY-(event.clientY-lastY)/rect.height*140));lastX=event.clientX;lastY=event.clientY;photo.style.backgroundPosition=`${state.panX}% ${state.panY}%`;photo.style.setProperty('--view-x',`${state.panX}%`);photo.style.setProperty('--view-y',`${state.panY}%`);});
          photo.addEventListener('pointerup',()=>{dragging=false;});photo.addEventListener('pointercancel',()=>{dragging=false;});
        }card.append(photo,el('h4','mka-post-title',`${themes[state.view]} · ${periodLabel}`));
        const collage=el('div','mka-post-stickers');
        state.stickers.forEach((item,i)=>{const mark=marks[item.key],n=button(`选中${mark[1]}装饰`,()=>{state.activeSticker=i;render();},`mka-post-sticker${state.activeSticker===i?' is-active':''}`,collage);n.replaceChildren(icon(mark[0]));n.style.cssText=`--x:${item.x}%;--y:${item.y}%;--turn:${item.turn}deg;left:${item.x}%;top:${item.y}%;transform:translate(-50%,-50%) rotate(${item.turn}deg)`;n.disabled=state.step!==1;
          if(state.step===1){let dragging=false,moved=false;let startX=0,startY=0;n.style.touchAction='none';n.addEventListener('pointerdown',event=>{dragging=true;moved=false;startX=event.clientX;startY=event.clientY;state.activeSticker=i;n.setPointerCapture(event.pointerId);});n.addEventListener('pointermove',event=>{if(!dragging)return;if(Math.hypot(event.clientX-startX,event.clientY-startY)>4)moved=true;if(!moved)return;const rect=collage.getBoundingClientRect();item.x=Math.max(8,Math.min(92,(event.clientX-rect.left)/rect.width*100));item.y=Math.max(12,Math.min(88,(event.clientY-rect.top)/rect.height*100));n.style.left=`${item.x}%`;n.style.top=`${item.y}%`;});n.addEventListener('pointerup',()=>{dragging=false;if(moved)render();});n.addEventListener('pointercancel',()=>{dragging=false;render();});}
        });photo.append(collage);card.append(el('p','mka-post-message',state.note||'留一句你想对他说的话。'));stage.append(card);
        if(state.step===0){
          story('站在候车线里面就好。我替你扶住相机带，画面由你来定。');say('在安全的候车区调整取景。主题决定这张卡片的题名，拖动画面或用方向与远近按钮调整构图。');
          Object.entries(themes).forEach(([key,label])=>choice(label,()=>{state.view=key;render();},state.view===key));
          [['向左取景',-15,0],['向右取景',15,0],['镜头抬高',0,-15],['镜头放低',0,15]].forEach(([label,x,y])=>button(label,()=>{state.panX=Math.max(0,Math.min(100,state.panX+x));state.panY=Math.max(0,Math.min(100,state.panY+y));render();},'mka-quiet'));
          button(state.zoom===1?'拉近画面':'还原远景',()=>{state.zoom=state.zoom===1?1.35:1;render();});button('请巴卫帮我稳住，按下快门',()=>{state.step=1;render();});return;
        }
        if(state.step===1){
          story('拍得不错。纸边和邮戳你来挑，我把卡片按稳。');say(`装饰 ${state.stickers.length}/3。最多三枚，可拖动排版，也可选中后用按钮微调。`);
          Object.entries(frames).forEach(([key,label])=>choice(label,()=>{state.frame=key;render();},state.frame===key));
          Object.entries(marks).forEach(([key,mark])=>{const b=button(`添加${mark[1]}`,()=>{state.stickers.push({key,x:22+state.stickers.length*28,y:50,turn:0});state.activeSticker=state.stickers.length-1;render();});b.disabled=state.stickers.length>=3;});
          const active=state.stickers[state.activeSticker??-1];if(active){[['装饰左移',-8,0],['装饰右移',8,0],['装饰上移',0,-12],['装饰下移',0,12]].forEach(([label,x,y])=>button(label,()=>{active.x=Math.max(8,Math.min(92,active.x+x));active.y=Math.max(12,Math.min(88,active.y+y));render();},'mka-quiet'));button('转动选中装饰',()=>{active.turn=(active.turn+15)%360;render();},'mka-quiet');button('移除选中装饰',()=>{state.stickers.splice(state.activeSticker,1);state.activeSticker=state.stickers.length-1;render();},'mka-quiet');}
          button('重新取景',()=>{state.step=0;render();},'mka-quiet');button('排版完成，写下寄语',()=>{state.step=2;render();});return;
        }
        const notes={'把今天的海风寄给你。':'那我收好了。下次想来，也叫上我。','下次还一起等这班电车吧。':'好。只是下次出门前，记得把外套带上。','今天有你陪着，很开心。':'……我也是。卡片收好，别让海风吹走了。'};
        if(state.step===2){story('还差一句话。想写什么，就照你的意思写。',state.note);say('选择你想表达的寄语，再查看完整成品。');Object.keys(notes).forEach(note=>choice(note,()=>{state.note=note;render();},state.note===note));button('返回调整排版',()=>{state.step=1;render();},'mka-quiet');const done=button('给巴卫看成品',()=>{state.step=3;render();});done.disabled=!state.note;return;}
        story(notes[state.note],state.note);sceneCaption('由你取景、排版、写下寄语的海风明信片。');say('成品已展开，可以返回修改，或者收好这次共同留影。');
        if(!completed){button('返回修改',()=>{state.step=2;render();},'mka-quiet');button('收好这张共同明信片',()=>{finishMoment(`${periodLabel}与巴卫在候车区共同留影，以「${themes[state.view]}」为题，用${frames[state.frame]}排版${state.stickers.length}枚装饰。你写下：「${state.note}」巴卫回应：「${notes[state.note]}」`,{view:state.view,frame:state.frame,crop:{x:state.panX,y:state.panY,zoom:state.zoom},stickers:state.stickers.map(item=>({...item})),note:state.note});controls.querySelectorAll('button').forEach(b=>{b.disabled=true;});});}
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
  return {mount,getMemoryBook:readMemoryBook};
}

const SCENES = {
  R01: { place:'御影神社', title:'庭前拾叶', note:'和巴卫商量分工，看清风向，再沿着庭院把叶子扫进篮里。最后共同安排留下的秋色，并选择你想说的话。', tags:['拖扫与按钮均可操作','一起分工与布置','女主回应由你选择'] },
  R02: { place:'坂道住宅区', title:'与猫慢慢熟悉', note:'和巴卫一起观察猫的耳朵、尾巴与距离，选好分工，再按它的反应调整动作。猫会自己决定是否走近，最后留下一段你选择的对话。', tags:['观察姿态与距离','配合巴卫慢慢接近','不强求触摸'] },
  R03: { place:'团子小店', title:'串起一签春色', note:'按顺序挑三颗团子，逐颗观察火候并调节火力，最后选择蘸料和点缀。之后可以直接收好，也能和巴卫在街角旧货摊玩三局玻璃弹珠。', tags:['团子手作与火候选择','可选弹珠路线挑战','收录进可备份的旧物回忆册'] },
  R04: { place:'清溪石桥', title:'让纸舟顺水走', note:'折好纸舟后拖动它穿过三道水门，船形决定可通行的水道。走错能重新尝试，也可以用按钮选路。', tags:['三道河道闯关','拖动或按钮操作','无需赶时间'] },
  R05: { place:'临海车站', title:'等车时的一枚票根', note:'从站前出发，按顺序安排两处停靠与终点，再逐站盖上纪念印。可以回退重排路线。', tags:['三站路线规划','停靠顺序会改变票根','预绘车站场景'] },
  R06: { place:'海边电车站', title:'海风寄来的明信片', note:'和巴卫在安全站台上商量取景，调整画面，再给明信片安排邮戳、装饰与寄语。你可以选择如何回应他，把共同完成的画面收好。', tags:['调整取景与装饰位置','双人制作明信片','预览后再收好'] },
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
  const activities = createMikageActivities(host);
  const mountActivity = activities.mount;
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
    note.textContent = '这段散策不会消耗道具。完成后会写进当前对话的散策手帖，并把一件小物收进本设备的旧物回忆册。';
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
      const companionArt = { ...ART };
      // Reuse the existing wardrobe catalog; no portrait bytes enter the card.
      try {
        const appearance = host.MikageShrinePanels?.getAppearance?.() || {};
        const artApi = host.MikageCharacterArt;
        if (artApi?.portrait) {
          for (const [actor,key,fallback] of [['tomoe','tomoe','usual'],['player','heroine','daily']]) {
            try {
              const url = artApi.portrait(actor,appearance[actor] || fallback);
              if (typeof url === 'string' && /^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(url)) companionArt[key] = url;
            } catch {}
          }
        }
      } catch {}
      game = mountActivity(gameArea,{
        region,
        reducedMotion:!!options.reducedMotion,
        period:options.period || 'day',
        art:companionArt,
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
      try{const face=new doc.defaultView.FontFace('Mikage Serif',`url("${GAME_FONT_URL}")`,{unicodeRange:GAME_FONT_RANGE});doc.fonts.add(face);await face.load();}catch{}
    });
    requestAnimationFrame(()=>{if(!closed)begin.focus({ preventScroll:true });});
    return handle;
  }

  const api = {
    version,
    open,
    getMemoryBook: activities.getMemoryBook,
    close(){ current?.close(); },
    dispose(){ current?.close({ notify:false });if(host.MikageMinigames===api)delete host.MikageMinigames; },
  };
  host.MikageMinigames = api;
  host.addEventListener?.('pagehide',api.dispose,{once:true});
  return api;
}
