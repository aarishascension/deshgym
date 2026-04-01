import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { saveSite, loadSites, deleteSite, publishSite, signIn, signUp, signOut, onAuthChange, createCheckout, setSubdomain } from "./lib/db";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@400;600;700&display=swap');`;

const CSS = `${FONTS}*{margin:0;padding:0;box-sizing:border-box;}:root{--bg:#0a0a0a;--surface:#111;--card:#161616;--border:#222;--accent:#e8ff00;--accent2:#ff4d1c;--text:#f0f0f0;--muted:#555;--fd:'Bebas Neue',sans-serif;--fb:'Barlow',sans-serif;--fc:'Barlow Condensed',sans-serif;}body{background:var(--bg);color:var(--text);font-family:var(--fb);}.app{min-height:100vh;}.nav{position:sticky;top:0;z-index:100;background:rgba(10,10,10,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;height:60px;gap:12px;}.nav-logo{font-family:var(--fd);font-size:1.7rem;letter-spacing:2px;color:var(--accent);white-space:nowrap;}.nav-logo span{color:var(--text);}.nav-tabs{display:flex;gap:2px;flex-shrink:0;}.nav-tab{font-family:var(--fc);font-size:.78rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:7px 16px;border-radius:4px;cursor:pointer;border:1px solid transparent;transition:all .2s;background:none;color:var(--muted);}.nav-tab:hover{color:var(--text);border-color:var(--border);}.nav-tab.active{background:var(--accent);color:#000;border-color:var(--accent);}.nbadge{background:var(--accent2);color:#fff;border-radius:10px;padding:1px 6px;font-size:.65rem;margin-left:4px;vertical-align:middle;}.nav-cta{font-family:var(--fc);font-size:.75rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:8px 16px;border-radius:4px;white-space:nowrap;background:var(--accent2);color:#fff;border:none;cursor:pointer;transition:opacity .2s;flex-shrink:0;}.nav-cta:hover{opacity:.85;}`;

const CSS2 = `.hero{padding:70px 2rem 50px;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}.hero::before{content:'GYMS';position:absolute;right:-10px;top:-20px;font-family:var(--fd);font-size:22vw;color:rgba(232,255,0,.03);pointer-events:none;line-height:1;}.hero-label{font-family:var(--fc);font-size:.72rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:14px;}.hero-title{font-family:var(--fd);font-size:clamp(3rem,8vw,7rem);line-height:.9;letter-spacing:2px;margin-bottom:20px;}.hero-title em{font-style:normal;color:var(--accent2);}.hero-sub{font-size:1rem;color:var(--muted);max-width:480px;line-height:1.6;}.search-bar{padding:20px 2rem;border-bottom:1px solid var(--border);display:flex;gap:10px;flex-wrap:wrap;align-items:center;}.swrap{position:relative;flex:1;min-width:200px;}.sicon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;}.sinput{width:100%;padding:11px 13px 11px 38px;background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--fb);font-size:.88rem;outline:none;transition:border-color .2s;}.sinput:focus{border-color:var(--accent);}.sinput::placeholder{color:var(--muted);}.fbtn{padding:11px 16px;border-radius:6px;cursor:pointer;font-family:var(--fc);font-size:.75rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;transition:all .2s;background:var(--card);border:1px solid var(--border);color:var(--muted);}.fbtn:hover,.fbtn.on{border-color:var(--accent);color:var(--accent);}.fbtn.on{background:rgba(232,255,0,.07);}.gym-grid{padding:28px 2rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;}.gym-card{background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer;transition:transform .2s,border-color .2s;}.gym-card:hover{transform:translateY(-4px);border-color:#2a2a2a;}.gym-img{width:100%;height:190px;display:flex;align-items:center;justify-content:center;font-size:5rem;position:relative;overflow:hidden;}.gbadge{position:absolute;top:11px;left:11px;font-family:var(--fc);font-size:.68rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:3px 9px;border-radius:3px;background:var(--accent);color:#000;}.gbadge.p{background:var(--accent2);color:#fff;}.grating{position:absolute;top:11px;right:11px;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);border-radius:20px;padding:3px 9px;font-family:var(--fc);font-size:.75rem;font-weight:700;color:var(--accent);}.gym-body{padding:16px;}.gtype{font-family:var(--fc);font-size:.68rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:5px;}.gname{font-family:var(--fd);font-size:1.4rem;letter-spacing:1px;margin-bottom:7px;}.gloc{font-size:.83rem;color:var(--muted);margin-bottom:12px;}.chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:13px;}.chip{font-size:.68rem;font-family:var(--fc);font-weight:600;padding:2px 9px;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--muted);}.gdesc{font-size:.8rem;color:var(--muted);line-height:1.5;margin-bottom:13px;}.gfooter{display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);}.gprice{font-family:var(--fd);font-size:1.25rem;letter-spacing:1px;}.gprice span{font-family:var(--fb);font-size:.72rem;color:var(--muted);font-weight:400;}.gbtn{font-family:var(--fc);font-size:.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:7px 14px;border-radius:4px;cursor:pointer;background:var(--accent);color:#000;border:none;transition:opacity .2s;}.gbtn:hover{opacity:.85;}`;

const CSS3 = `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}.overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease;}.modal{background:var(--card);border:1px solid var(--border);border-radius:14px;width:100%;max-width:660px;max-height:90vh;overflow-y:auto;animation:slideUp .25s ease;}.mhero{width:100%;height:220px;display:flex;align-items:center;justify-content:center;font-size:7rem;position:relative;}.mclose{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.6);border:1px solid var(--border);color:var(--text);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}.mclose:hover{background:rgba(255,255,255,.1);}.mbody{padding:24px;}.mtype{font-family:var(--fc);font-size:.68rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:5px;}.mname{font-family:var(--fd);font-size:2.6rem;letter-spacing:2px;line-height:1;margin-bottom:10px;}.mmeta{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;}.mmeta-i{display:flex;align-items:center;gap:5px;font-size:.83rem;color:var(--muted);}.mmeta-i strong{color:var(--text);}.mrating{display:flex;align-items:center;gap:8px;margin-bottom:18px;}.stars{color:#f5c518;letter-spacing:2px;}.rnum{font-family:var(--fd);font-size:1.3rem;color:var(--accent);}.rcnt{font-size:.8rem;color:var(--muted);}.mtabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:20px;}.mtab{flex:1;padding:11px;border:none;background:none;cursor:pointer;font-family:var(--fc);font-size:.75rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);border-bottom:2px solid transparent;transition:all .2s;}.mtab.active{color:var(--accent);border-bottom-color:var(--accent);}.stitle{font-family:var(--fc);font-size:.68rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;}.mdesc{font-size:.88rem;line-height:1.7;color:#aaa;margin-bottom:20px;}.mamnts{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:20px;}.mamnt{font-family:var(--fc);font-size:.75rem;font-weight:600;letter-spacing:.5px;padding:5px 13px;border-radius:20px;border:1px solid var(--border);color:var(--text);background:rgba(255,255,255,.04);}.mdiv{border:none;border-top:1px solid var(--border);margin:18px 0;}.pbox{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:14px;}.plbl{font-family:var(--fc);font-size:.68rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:3px;}.pval{font-family:var(--fd);font-size:2rem;letter-spacing:1px;color:var(--accent);}.psub{font-size:.75rem;color:var(--muted);}.macts{display:flex;gap:8px;}.mpbtn{flex:1;padding:13px;border-radius:7px;cursor:pointer;font-family:var(--fd);font-size:1.15rem;letter-spacing:2px;background:var(--accent);color:#000;border:none;transition:opacity .2s;}.mpbtn:hover{opacity:.87;}.msbtn{padding:13px 16px;border-radius:7px;cursor:pointer;font-family:var(--fc);font-size:.78rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:none;border:1px solid var(--border);color:var(--muted);transition:all .2s;}.msbtn:hover{color:var(--text);border-color:#444;}`;

const CSS4 = `.sbar{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px;padding:13px 15px;background:var(--surface);border-radius:8px;border:1px solid var(--border);}.stn{text-align:center;}.stn-n{font-family:var(--fd);font-size:1.5rem;letter-spacing:1px;color:var(--accent);}.stn-l{font-family:var(--fc);font-size:.62rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);}.cat-title{font-family:var(--fc);font-size:.68rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin:18px 0 9px;display:flex;align-items:center;gap:8px;}.cat-title::after{content:'';flex:1;height:1px;background:var(--border);}.eq-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;}.eq-card{background:var(--surface);border:1px solid var(--border);border-radius:9px;overflow:hidden;position:relative;transition:border-color .2s;}.eq-card:hover .delbtn{opacity:1;}.eqimg{width:100%;height:100px;object-fit:cover;display:block;}.eqph{width:100%;height:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--card);cursor:pointer;position:relative;transition:background .2s;}.eqph:hover{background:#1e1e1e;}.eqph input,.imgw input{position:absolute;inset:0;opacity:0;cursor:pointer;}.upi{font-size:1.5rem;margin-bottom:3px;}.upl{font-family:var(--fc);font-size:.6rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);}.imgw{position:relative;}.imgch{position:absolute;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;cursor:pointer;}.imgw:hover .imgch{opacity:1;}.imgchl{font-family:var(--fc);font-size:.65rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#fff;pointer-events:none;}.eqi{padding:9px;}.eqnm{font-family:var(--fc);font-size:.8rem;font-weight:700;color:var(--text);margin-bottom:1px;line-height:1.2;}.eqqt{font-size:.7rem;color:var(--muted);}.delbtn{position:absolute;top:5px;right:5px;width:22px;height:22px;border-radius:50%;background:rgba(255,77,28,.85);border:none;color:#fff;font-size:.7rem;cursor:pointer;opacity:0;transition:opacity .2s;display:flex;align-items:center;justify-content:center;}.addform{background:var(--surface);border:1px dashed var(--border);border-radius:9px;padding:16px;margin-top:18px;}.addtitle{font-family:var(--fc);font-size:.7rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:12px;}.addrow{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:9px;}.addinput{width:100%;padding:9px 12px;background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--fb);font-size:.83rem;outline:none;transition:border-color .2s;}.addinput:focus{border-color:var(--accent);}.addinput::placeholder{color:var(--muted);}.addbtn{width:100%;padding:10px;border-radius:6px;cursor:pointer;font-family:var(--fc);font-size:.8rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;background:var(--accent);color:#000;border:none;transition:opacity .2s;margin-top:4px;}.addbtn:hover{opacity:.88;}`;

const CSS5 = `.tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px;}.tcard{background:var(--surface);border:1px solid var(--border);border-radius:11px;overflow:hidden;position:relative;text-align:center;transition:border-color .2s,transform .2s;}.tcard:hover{border-color:#333;transform:translateY(-2px);}.tcard:hover .delbtn{opacity:1;}.tavtr{width:100%;height:130px;object-fit:cover;display:block;}.tph{width:100%;height:130px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--card);cursor:pointer;position:relative;transition:background .2s;}.tph:hover{background:#1e1e1e;}.tph input{position:absolute;inset:0;opacity:0;cursor:pointer;}.temoji{font-size:2.8rem;margin-bottom:3px;}.tinfo{padding:11px 9px 13px;}.tnm{font-family:var(--fc);font-size:.9rem;font-weight:700;color:var(--text);margin-bottom:2px;}.trl{font-size:.68rem;color:var(--accent);font-family:var(--fc);font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:7px;}.ttags{display:flex;flex-wrap:wrap;gap:3px;justify-content:center;margin-bottom:7px;}.ttag{font-size:.6rem;font-family:var(--fc);font-weight:600;padding:2px 7px;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--muted);}.tstats{display:flex;gap:6px;justify-content:center;}.tstat{font-size:.62rem;font-family:var(--fc);font-weight:700;letter-spacing:.5px;padding:2px 7px;border-radius:20px;background:rgba(232,255,0,.08);color:var(--accent);border:1px solid rgba(232,255,0,.2);}`;

const CSS6 = `.joverlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .18s ease;}.jmodal{background:var(--card);border:1px solid var(--border);border-radius:14px;width:100%;max-width:440px;animation:slideUp .22s ease;overflow:hidden;}.jhdr{padding:22px 26px 0;}.jgnm{font-family:var(--fd);font-size:1.7rem;letter-spacing:2px;margin-bottom:2px;}.jsub{font-family:var(--fc);font-size:.7rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:18px;}.jplans{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:18px;}.jplan{padding:11px 7px;border-radius:7px;cursor:pointer;text-align:center;border:1.5px solid var(--border);background:var(--surface);transition:all .15s;}.jplan.sel{border-color:var(--accent);background:rgba(232,255,0,.07);}.jpnm{font-family:var(--fc);font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:3px;}.jplan.sel .jpnm{color:var(--accent);}.jppr{font-family:var(--fd);font-size:1.15rem;letter-spacing:1px;}.jpsv{font-size:.62rem;color:var(--accent2);font-weight:700;font-family:var(--fc);}.jflds{padding:0 26px;display:flex;flex-direction:column;gap:9px;}.jnput{width:100%;padding:10px 13px;background:var(--surface);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--fb);font-size:.88rem;outline:none;transition:border-color .2s;}.jnput:focus{border-color:var(--accent);}.jnput::placeholder{color:var(--muted);}.jfoot{padding:18px 26px 26px;display:flex;gap:9px;}.jsbmt{flex:1;padding:13px;border-radius:7px;cursor:pointer;font-family:var(--fd);font-size:1.25rem;letter-spacing:2px;background:var(--accent);color:#000;border:none;transition:opacity .2s;display:flex;align-items:center;justify-content:center;}.jsbmt:hover:not(:disabled){opacity:.87;}.jsbmt:disabled{opacity:.45;cursor:not-allowed;}.jcncl{padding:13px 16px;border-radius:7px;cursor:pointer;font-family:var(--fc);font-size:.77rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:none;border:1px solid var(--border);color:var(--muted);transition:all .2s;}.jcncl:hover{color:var(--text);border-color:#444;}.jscc{padding:44px 26px;text-align:center;}.jchk{width:68px;height:68px;border-radius:50%;background:rgba(232,255,0,.12);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:1.9rem;margin:0 auto 18px;animation:popIn .4s cubic-bezier(.175,.885,.32,1.275);}.jstl{font-family:var(--fd);font-size:2.2rem;letter-spacing:2px;color:var(--accent);margin-bottom:7px;}.jsmg{font-size:.88rem;color:var(--muted);line-height:1.6;margin-bottom:7px;}.jsdt{font-family:var(--fc);font-size:.75rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text);background:var(--surface);padding:11px 18px;border-radius:7px;margin:14px 0 22px;border:1px solid var(--border);}.jsdn{padding:11px 30px;border-radius:7px;cursor:pointer;font-family:var(--fc);font-size:.82rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;background:var(--accent);color:#000;border:none;transition:opacity .2s;}.jsdn:hover{opacity:.87;}.spinner{width:48px;height:48px;border-radius:50%;border:3px solid var(--border);border-top-color:var(--accent);animation:spin .8s linear infinite;}.spintxt{font-family:var(--fc);font-size:.82rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);}.spinico{animation:spin .7s linear infinite;display:inline-block;}`;

const CSS7 = `.creator{display:grid;grid-template-columns:400px 1fr;min-height:calc(100vh - 60px);}.cpanel{background:var(--surface);border-right:1px solid var(--border);overflow-y:auto;padding:28px 24px;}.cptitle{font-family:var(--fd);font-size:1.8rem;letter-spacing:2px;margin-bottom:6px;}.cpsub{font-size:.83rem;color:var(--muted);margin-bottom:28px;}.fsec{margin-bottom:24px;}.fstitle{font-family:var(--fc);font-size:.68rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:12px;padding-bottom:7px;border-bottom:1px solid var(--border);}.frow{margin-bottom:12px;}.flbl{display:block;font-size:.77rem;font-weight:700;color:var(--muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px;font-family:var(--fc);}.finput,.ftxt,.fsel{width:100%;padding:10px 13px;background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--fb);font-size:.88rem;outline:none;transition:border-color .2s;}.finput:focus,.ftxt:focus,.fsel:focus{border-color:var(--accent);}.ftxt{resize:vertical;min-height:85px;}.fsel option{background:var(--card);}.atogls{display:flex;flex-wrap:wrap;gap:7px;}.atogl{font-family:var(--fc);font-size:.72rem;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:5px 13px;border-radius:20px;cursor:pointer;border:1px solid var(--border);background:none;color:var(--muted);transition:all .15s;}.atogl.on{border-color:var(--accent);color:var(--accent);background:rgba(232,255,0,.08);}.tswatches{display:flex;gap:9px;flex-wrap:wrap;}.tswatch{width:42px;height:42px;border-radius:7px;cursor:pointer;border:2px solid transparent;transition:all .15s;}.tswatch.sel{border-color:var(--accent);transform:scale(1.12);}.genbtn{width:100%;padding:15px;border-radius:7px;cursor:pointer;font-family:var(--fd);font-size:1.35rem;letter-spacing:2px;background:var(--accent);color:#000;border:none;transition:all .2s;margin-top:6px;}.genbtn:hover{opacity:.9;transform:translateY(-1px);}.genbtn:disabled{opacity:.45;cursor:not-allowed;transform:none;}.cprev{background:#0d0d0d;display:flex;flex-direction:column;align-items:center;padding:28px 22px;overflow-y:auto;}.prvhdr{width:100%;max-width:880px;display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}.prvlbl{font-family:var(--fc);font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);}.prvacts{display:flex;gap:7px;}.prvact{font-family:var(--fc);font-size:.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:7px 16px;border-radius:5px;cursor:pointer;border:1px solid var(--border);background:var(--card);color:var(--muted);transition:all .2s;}.prvact:hover{color:var(--text);border-color:#444;}.prvact.pub{background:var(--accent);color:#000;border-color:var(--accent);}.bwrap{width:100%;max-width:880px;border-radius:10px;overflow:hidden;border:1px solid var(--border);min-height:560px;}.bbar{background:#1a1a1a;padding:9px 15px;display:flex;align-items:center;gap:7px;border-bottom:1px solid var(--border);}.bdot{width:10px;height:10px;border-radius:50%;}.burl{flex:1;background:var(--card);border-radius:4px;padding:4px 11px;font-size:.72rem;color:var(--muted);font-family:monospace;}.pbody{min-height:520px;}.ldstate{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:480px;gap:18px;}.emstate{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:480px;gap:14px;text-align:center;padding:40px;}.emico{font-size:3.5rem;opacity:.3;}.emtitle{font-family:var(--fd);font-size:1.8rem;letter-spacing:2px;color:var(--muted);}.emsub{font-size:.87rem;color:var(--muted);max-width:300px;line-height:1.6;}`;

const CSS8 = `.wpage{padding:36px 2rem;}.wphdr{margin-bottom:28px;}.wptitle{font-family:var(--fd);font-size:clamp(2rem,5vw,3.5rem);letter-spacing:2px;line-height:1;margin-bottom:7px;}.wptitle em{font-style:normal;color:var(--accent);}.wpsub{font-size:.88rem;color:var(--muted);}.wgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:18px;}.wcard{background:var(--card);border:1px solid var(--border);border-radius:11px;overflow:hidden;transition:transform .2s,border-color .2s;}.wcard:hover{transform:translateY(-3px);border-color:#2a2a2a;}.wthumb{width:100%;height:170px;position:relative;overflow:hidden;background:var(--surface);cursor:pointer;}.wthumb iframe{width:200%;height:200%;transform:scale(.5);transform-origin:top left;pointer-events:none;border:none;}.wthumb-ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(0,0,0,0);transition:background .2s;}.wthumb:hover .wthumb-ov{background:rgba(0,0,0,.55);}.wthumb-btn{opacity:0;transition:opacity .2s;font-family:var(--fc);font-size:.72rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:9px 16px;border-radius:6px;cursor:pointer;background:var(--accent);color:#000;border:none;}.wthumb:hover .wthumb-btn{opacity:1;}.wcbody{padding:15px;}.wcnm{font-family:var(--fd);font-size:1.3rem;letter-spacing:1px;margin-bottom:3px;}.wcmeta{font-size:.75rem;color:var(--muted);margin-bottom:10px;display:flex;gap:10px;flex-wrap:wrap;}.wcurl{font-family:monospace;font-size:.7rem;color:var(--accent);background:rgba(232,255,0,.07);padding:5px 10px;border-radius:4px;border:1px solid rgba(232,255,0,.15);margin-bottom:10px;word-break:break-all;}.wcacts{display:flex;gap:6px;}.wbtn{font-family:var(--fc);font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:8px;border-radius:5px;cursor:pointer;border:1px solid var(--border);background:var(--surface);color:var(--muted);transition:all .15s;flex:1;}.wbtn:hover{color:var(--text);border-color:#444;}.wbtn.p{background:var(--accent);color:#000;border-color:var(--accent);}.wbtn.p:hover{opacity:.87;}.wbtn.d:hover{border-color:var(--accent2);color:var(--accent2);}.wempty{text-align:center;padding:70px 20px;color:var(--muted);}.wemico{font-size:3.5rem;margin-bottom:14px;opacity:.3;}.wetitle{font-family:var(--fd);font-size:1.8rem;letter-spacing:2px;margin-bottom:7px;}.wesub{font-size:.87rem;line-height:1.6;max-width:300px;margin:0 auto 22px;}.wecta{font-family:var(--fc);font-size:.8rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:11px 26px;border-radius:6px;cursor:pointer;background:var(--accent);color:#000;border:none;transition:opacity .2s;}.wecta:hover{opacity:.87;}`;

const CSS9 = `.viewer{position:fixed;inset:0;z-index:500;background:#000;display:flex;flex-direction:column;animation:fadeIn .2s ease;}.vbar{display:flex;align-items:center;gap:10px;padding:9px 16px;background:#111;border-bottom:1px solid var(--border);flex-shrink:0;}.vdots{display:flex;gap:6px;}.vdot{width:12px;height:12px;border-radius:50%;}.vurlbar{flex:1;background:var(--card);border:1px solid var(--border);border-radius:20px;padding:6px 16px;font-family:monospace;font-size:.75rem;color:var(--accent);display:flex;align-items:center;gap:8px;}.vlck{color:var(--muted);}.vacts{display:flex;gap:7px;}.vbtn{font-family:var(--fc);font-size:.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:7px 14px;border-radius:5px;cursor:pointer;border:1px solid var(--border);background:var(--surface);color:var(--muted);transition:all .2s;}.vbtn:hover{color:var(--text);border-color:#555;}.vbtn.a{background:var(--accent);color:#000;border-color:var(--accent);}.vbtn.a:hover{opacity:.87;}.viframe{flex:1;border:none;width:100%;}.shareov{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.92);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .15s ease;}.sharemod{background:var(--card);border:1px solid var(--border);border-radius:14px;width:100%;max-width:420px;padding:28px;animation:slideUp .2s ease;}.sharetitle{font-family:var(--fd);font-size:1.8rem;letter-spacing:2px;margin-bottom:4px;}.sharesitename{font-family:var(--fc);font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:20px;}.shareurlbox{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:10px;margin-bottom:18px;}.shareurltext{flex:1;font-family:monospace;font-size:.73rem;color:var(--accent);word-break:break-all;}.copybtn{font-family:var(--fc);font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:6px 14px;border-radius:5px;cursor:pointer;background:var(--accent);color:#000;border:none;transition:all .2s;white-space:nowrap;}.copybtn:hover{opacity:.87;}.copybtn.ok{background:#22c55e;color:#fff;}.sharelbl{font-size:.68rem;font-family:var(--fc);font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;}.shareplats{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:18px;}.shareplat{display:flex;flex-direction:column;align-items:center;gap:5px;padding:13px 8px;border-radius:9px;cursor:pointer;background:var(--surface);border:1px solid var(--border);transition:all .15s;}.shareplat:hover{border-color:#333;transform:translateY(-2px);}.spico{font-size:1.5rem;}.spnm{font-family:var(--fc);font-size:.58rem;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);}.sharecls{width:100%;padding:11px;border-radius:7px;cursor:pointer;font-family:var(--fc);font-size:.78rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:none;border:1px solid var(--border);color:var(--muted);transition:all .2s;}.sharecls:hover{color:var(--text);border-color:#444;}.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:8px;border:none;background:none;}.hamburger span{display:block;width:22px;height:2px;background:var(--text);border-radius:2px;transition:all .2s;}.mob-menu{display:none;position:fixed;inset:0;top:60px;z-index:99;background:rgba(10,10,10,.98);backdrop-filter:blur(12px);flex-direction:column;padding:24px;gap:8px;}.mob-menu.open{display:flex;}.mob-tab{font-family:var(--fc);font-size:1rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:14px 18px;border-radius:8px;cursor:pointer;border:1px solid var(--border);background:none;color:var(--muted);text-align:left;transition:all .2s;}.mob-tab.active{background:var(--accent);color:#000;border-color:var(--accent);}.ob-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;padding:20px;animation:fadeIn .2s;}.ob-card{background:var(--card);border:1px solid var(--border);border-radius:16px;width:100%;max-width:480px;padding:28px;animation:slideUp .3s ease;margin-bottom:20px;}.ob-step{font-family:var(--fc);font-size:.65rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:8px;}.ob-title{font-family:var(--fd);font-size:2rem;letter-spacing:2px;color:var(--accent);margin-bottom:8px;}.ob-desc{font-size:.88rem;color:#aaa;line-height:1.6;margin-bottom:22px;}.ob-actions{display:flex;gap:10px;}.ob-next{flex:1;padding:12px;border-radius:7px;cursor:pointer;font-family:var(--fd);font-size:1.1rem;letter-spacing:2px;background:var(--accent);color:#000;border:none;}.ob-skip{padding:12px 18px;border-radius:7px;cursor:pointer;font-family:var(--fc);font-size:.75rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:none;border:1px solid var(--border);color:var(--muted);}.ob-dots{display:flex;gap:6px;margin-bottom:18px;}.ob-dot{width:8px;height:8px;border-radius:50%;background:var(--border);transition:background .2s;}.ob-dot.on{background:var(--accent);}.stat-pill{display:inline-flex;align-items:center;gap:5px;font-family:var(--fc);font-size:.68rem;font-weight:700;letter-spacing:1px;padding:3px 9px;border-radius:20px;background:rgba(232,255,0,.08);border:1px solid rgba(232,255,0,.15);color:var(--accent);margin-right:5px;}@media(max-width:768px){.nav-tabs{display:none;}.nav-cta{display:none;}.hamburger{display:flex;}.creator{grid-template-columns:1fr;}.cprev{display:none;}}`;

const FULL_CSS = CSS + CSS2 + CSS3 + CSS4 + CSS5 + CSS6 + CSS7 + CSS8 + CSS9;

// ── Types ──────────────────────────────────────────────────────────────────
interface Gym {
  id: number; name: string; type: string; location: string; price: number;
  rating: number; reviews: number; badge: string | null; isPremium?: boolean;
  amenities: string[]; gradient: string; emoji: string; desc: string;
}
interface Equipment {
  id: number; name: string; category: string; qty: number; photo: string | null;
}
interface Trainer {
  id: number; name: string; role: string; exp: string; speciality: string;
  cert: string; rating: number; sessions: number; photo: string | null;
}
interface Site {
  id: number; name: string; tagline: string; type: string; location: string;
  price: string; theme: string; slug: string; url: string; createdAt: string; html: string;
  formData?: GymForm; selAmns?: string[]; cPlans?: { id: number; name: string; price: string; features: string }[];
  versions?: { html: string; createdAt: string }[];
}
interface Theme { id: string; label: string; bg: string; accent: string; }
interface JForm { name: string; phone: string; email: string; plan: string; startDate: string; }
interface GymForm {
  name: string; tagline: string; type: string; location: string; phone: string;
  email: string; price: string; hours: string; description: string; highlights: string;
}

// ── Static Data ────────────────────────────────────────────────────────────
const GYM_DATA: Gym[] = [
  { id:1,name:"SHAKTI STRENGTH",type:"Powerlifting",location:"Bengaluru, Karnataka",price:2499,rating:4.9,reviews:312,badge:"TOP RATED",amenities:["Free Weights","Platform","Sauna","24/7 Access"],gradient:"linear-gradient(135deg,#1a1a2e,#16213e)",emoji:"🏋️",desc:"Bengaluru's premier powerlifting destination with 10 dedicated platforms and competition-grade equipment." },
  { id:2,name:"KRATOS FITNESS",type:"CrossFit & Functional",location:"Mumbai, Maharashtra",price:4999,rating:4.8,reviews:198,badge:"PREMIUM",isPremium:true,amenities:["CrossFit Rig","Assault Bikes","Turf Lane","Nutrition Bar"],gradient:"linear-gradient(135deg,#1a0a00,#2d1b00)",emoji:"⚡",desc:"Mumbai's elite functional fitness facility with daily WODs, certified coaches and community events." },
  { id:3,name:"PRAANA",type:"Yoga & Pilates",location:"Rishikesh, Uttarakhand",price:1999,rating:4.7,reviews:445,badge:"NEW",amenities:["Yoga Studio","Meditation Room","Ayurveda Spa","Juice Bar"],gradient:"linear-gradient(135deg,#0d1117,#1a1f2e)",emoji:"🧘",desc:"A sacred sanctuary in the Yoga capital of the world where ancient tradition meets modern wellness." },
  { id:4,name:"IRON TEMPLE",type:"Bodybuilding",location:"Delhi, NCR",price:1799,rating:4.6,reviews:278,badge:null,amenities:["Cable Machines","Cardio Deck","Steam Room","Pro Shop"],gradient:"linear-gradient(135deg,#111,#1c1c1c)",emoji:"💪",desc:"Old Delhi's legendary bodybuilding gym with 200+ machines and a champion-producing legacy since 1998." },
  { id:5,name:"SURGE",type:"Boutique Fitness",location:"Hyderabad, Telangana",price:5999,rating:5.0,reviews:89,badge:"PREMIUM",isPremium:true,amenities:["Cycle Studio","HIIT Arena","Recovery Suite","Rooftop Track"],gradient:"linear-gradient(135deg,#0a1628,#162447)",emoji:"🔥",desc:"Hyderabad's most exclusive fitness experience with Bollywood trainers and panoramic city views." },
  { id:6,name:"DANGAL",type:"MMA & Boxing",location:"Pune, Maharashtra",price:2999,rating:4.8,reviews:367,badge:null,amenities:["Boxing Ring","MMA Cage","Bag Wall","Wrestling Mats"],gradient:"linear-gradient(135deg,#1a0000,#2d0000)",emoji:"🥊",desc:"Train like a champion. Pune's top combat sports academy with national-level coaches and fighters." },
  { id:7,name:"VOLT ATHLETIC",type:"CrossFit & Functional",location:"Chennai, Tamil Nadu",price:3499,rating:4.7,reviews:214,badge:"TOP RATED",amenities:["CrossFit Rig","Turf Lane","Nutrition Bar","Personal Training"],gradient:"linear-gradient(135deg,#0a1a0a,#0d2b0d)",emoji:"⚡",desc:"South India's fastest-growing functional fitness brand with data-driven programming and expert coaching." },
  { id:8,name:"KOLKATA IRON WORKS",type:"Bodybuilding",location:"Kolkata, West Bengal",price:1299,rating:4.5,reviews:512,badge:null,amenities:["Free Weights","Cardio Deck","Sauna","Locker Rooms"],gradient:"linear-gradient(135deg,#1a1000,#2a1e00)",emoji:"🏋️",desc:"The City of Joy's most storied gym — 3 decades of iron, sweat, and champions." },
];

const AMENITIES = ["Free Weights","Cardio Equipment","Swimming Pool","Sauna","Steam Room","CrossFit Rig","Boxing Ring","Yoga Studio","Pilates Reformers","Turf Lane","Parking","Locker Rooms","Personal Training","Nutrition Bar","Juice Bar","24/7 Access","Kids Club","Outdoor Area","Ayurveda Spa","Zumba Classes","Cricket Net","Kabaddi Court","WhatsApp Support","UPI Payments","Diet Consultation"];

const THEMES: Theme[] = [
  {id:"dark",label:"Dark Power",bg:"#0a0a0a",accent:"#e8ff00"},
  {id:"fire",label:"Fire",bg:"#0d0500",accent:"#ff4d1c"},
  {id:"steel",label:"Steel",bg:"#0d1117",accent:"#58a6ff"},
  {id:"forest",label:"Forest",bg:"#061210",accent:"#00ffb3"},
  {id:"rose",label:"Rose Gold",bg:"#110a0a",accent:"#ff9f7f"},
  {id:"void",label:"Void",bg:"#000",accent:"#fff"},
];

const GYM_TYPES = ["Powerlifting","CrossFit & Functional","Yoga & Pilates","Bodybuilding","MMA & Boxing","Boutique Fitness","Zumba & Dance","Kabaddi & Wrestling","Swimming","Cycling","General Fitness","Personal Training Studio","Calisthenics"];

const DEF_EQ: Record<string, Equipment[]> = {
  "Powerlifting":[{id:1,name:"Olympic Barbell",category:"Barbells",qty:12,photo:null},{id:2,name:"Competition Plates",category:"Barbells",qty:8,photo:null},{id:3,name:"Power Rack",category:"Racks",qty:6,photo:null},{id:4,name:"Deadlift Platform",category:"Racks",qty:4,photo:null},{id:5,name:"Bench Press Bench",category:"Benches",qty:6,photo:null},{id:6,name:"Dumbbell Set",category:"Free Weights",qty:1,photo:null}],
  "Bodybuilding":[{id:1,name:"Dumbbell Rack (2–50kg)",category:"Free Weights",qty:1,photo:null},{id:2,name:"Cable Crossover",category:"Cable Machines",qty:4,photo:null},{id:3,name:"Lat Pulldown",category:"Cable Machines",qty:3,photo:null},{id:4,name:"Leg Press",category:"Machines",qty:3,photo:null},{id:5,name:"Smith Machine",category:"Racks",qty:3,photo:null},{id:6,name:"Treadmill",category:"Cardio",qty:8,photo:null}],
  "CrossFit & Functional":[{id:1,name:"CrossFit Rig",category:"Rig",qty:2,photo:null},{id:2,name:"Assault Bike",category:"Cardio",qty:10,photo:null},{id:3,name:"Rowing Machine",category:"Cardio",qty:8,photo:null},{id:4,name:"Kettlebells",category:"Free Weights",qty:1,photo:null},{id:5,name:"Plyo Boxes",category:"Functional",qty:10,photo:null},{id:6,name:"Battle Ropes",category:"Functional",qty:4,photo:null}],
  "MMA & Boxing":[{id:1,name:"Boxing Ring",category:"Ring & Cage",qty:1,photo:null},{id:2,name:"MMA Cage",category:"Ring & Cage",qty:1,photo:null},{id:3,name:"Heavy Bags",category:"Bags",qty:12,photo:null},{id:4,name:"Speed Bags",category:"Bags",qty:6,photo:null},{id:5,name:"Wrestling Mats",category:"Flooring",qty:1,photo:null}],
  "Yoga & Pilates":[{id:1,name:"Yoga Mats",category:"Yoga",qty:30,photo:null},{id:2,name:"Yoga Blocks",category:"Yoga",qty:40,photo:null},{id:3,name:"Pilates Reformer",category:"Pilates",qty:10,photo:null},{id:4,name:"Balance Balls",category:"Accessories",qty:15,photo:null}],
  "Boutique Fitness":[{id:1,name:"Spin Bikes",category:"Cardio",qty:20,photo:null},{id:2,name:"TRX Trainer",category:"Suspension",qty:15,photo:null},{id:3,name:"Foam Rollers",category:"Recovery",qty:20,photo:null}],
};

const DEF_TR: Record<string, Trainer[]> = {
  "Powerlifting":[{id:1,name:"Arjun Malhotra",role:"Head Coach",exp:"12 yrs",speciality:"Squat & Deadlift",cert:"IPF Certified",rating:4.9,sessions:1840,photo:null},{id:2,name:"Priya Nair",role:"Strength Coach",exp:"7 yrs",speciality:"Olympic Lifting",cert:"NSCA-CSCS",rating:4.8,sessions:920,photo:null}],
  "Bodybuilding":[{id:1,name:"Vikram Singh",role:"Head Coach",exp:"15 yrs",speciality:"Hypertrophy & Cuts",cert:"ISSA Certified",rating:4.9,sessions:3200,photo:null},{id:2,name:"Deepa Menon",role:"Women's Coach",exp:"8 yrs",speciality:"Contest Prep",cert:"ACE-CPT",rating:4.8,sessions:1400,photo:null},{id:3,name:"Rohit Kapoor",role:"Nutrition Coach",exp:"6 yrs",speciality:"Diet & Macros",cert:"Precision Nutrition L2",rating:4.7,sessions:960,photo:null}],
  "CrossFit & Functional":[{id:1,name:"Kiran Desai",role:"CrossFit L3 Coach",exp:"10 yrs",speciality:"WOD Programming",cert:"CrossFit L3",rating:5.0,sessions:2100,photo:null},{id:2,name:"Sneha Reddy",role:"Gymnastics Coach",exp:"6 yrs",speciality:"Handstands & Bar",cert:"CrossFit L2",rating:4.8,sessions:780,photo:null}],
  "MMA & Boxing":[{id:1,name:"Manpreet Gill",role:"Head MMA Coach",exp:"14 yrs",speciality:"BJJ",cert:"BJJ Black Belt",rating:5.0,sessions:2600,photo:null},{id:2,name:"Farhan Shaikh",role:"Boxing Coach",exp:"10 yrs",speciality:"Footwork & Combos",cert:"BFI Level 3",rating:4.9,sessions:1900,photo:null}],
  "Yoga & Pilates":[{id:1,name:"Radha Sharma",role:"Senior Yoga Guru",exp:"18 yrs",speciality:"Ashtanga & Hatha",cert:"RYT 500",rating:5.0,sessions:4200,photo:null},{id:2,name:"Om Prakash",role:"Meditation Guide",exp:"12 yrs",speciality:"Pranayama",cert:"Morarji Desai Inst.",rating:4.9,sessions:2100,photo:null}],
  "Boutique Fitness":[{id:1,name:"Nisha Kapoor",role:"Cycle Studio Lead",exp:"5 yrs",speciality:"HIIT Cycling",cert:"Schwinn Certified",rating:4.9,sessions:1100,photo:null},{id:2,name:"Dev Anand",role:"HIIT Specialist",exp:"7 yrs",speciality:"Circuit Training",cert:"ACE Group Fitness",rating:4.7,sessions:990,photo:null}],
};

const getEqDef = (t: string): Equipment[] => DEF_EQ[t] || DEF_EQ["Bodybuilding"];
const getTrDef = (t: string): Trainer[] => DEF_TR[t] || DEF_TR["Bodybuilding"];
const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
const siteUrl = (n: string) => `https://deshgym.in/sites/${slugify(n)}`;

// ── QR Component ───────────────────────────────────────────────────────────
function QR({ val }: { val: string }) {
  const seed = val.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: 49 }, (_, i) => ((seed * (i + 7) * 13) % 3) === 0);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,8px)", gap: "2px" }}>
      {cells.map((on, i) => (
        <div key={i} style={{ width: "8px", height: "8px", borderRadius: "1px", background: on ? "var(--accent)" : "transparent" }} />
      ))}
    </div>
  );
}

// ── Before/After Form Component ───────────────────────────────────────────
function BAForm({ onAdd }: { onAdd: (item: { id: number; before: string; after: string; label: string }) => void }) {
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const readFile = (file: File, cb: (s: string) => void) => { const r = new FileReader(); r.onload = e => cb(e.target?.result as string); r.readAsDataURL(file); };
  return (
    <div className="addform">
      <div className="addtitle">+ Add Transformation</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px", marginBottom: "9px" }}>
        {([["before", before, setBefore, "📷", "grayscale(40%)"], ["after", after, setAfter, "✨", "none"]] as const).map(([side, img, setImg, icon, filt]) => (
          <label key={side} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 90, borderRadius: "7px", overflow: "hidden", cursor: "pointer", position: "relative", background: "var(--card)", border: "1px solid var(--border)" }}>
            {img ? <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover", filter: filt }} /> : <><span style={{ fontSize: "1.4rem" }}>{icon}</span><span style={{ fontFamily: "var(--fc)", fontSize: ".6rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--muted)", marginTop: 3 }}>{side}</span></>}
            <input type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setImg as (s: string) => void); }} />
          </label>
        ))}
      </div>
      <div className="addrow">
        <input className="addinput" placeholder="Label (e.g. 3 months result)" value={label} onChange={e => setLabel(e.target.value)} />
        <button className="addbtn" onClick={() => {
          if (!before || !after) return;
          onAdd({ id: Date.now(), before, after, label });
          setBefore(null); setAfter(null); setLabel("");
        }}>ADD</button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selGym, setSelGym] = useState<Gym | null>(null);
  const [mtab, setMtab] = useState("overview");
  const [gymEq, setGymEq] = useState<Record<number, Equipment[]>>({});
  const [gymOverrides, setGymOverrides] = useState<Record<number, Partial<Gym>>>({});
  const [editDraft, setEditDraft] = useState<Partial<Gym>>({});
  const [newEq, setNewEq] = useState({ name: "", category: "", qty: 1 });
  const [gymTr, setGymTr] = useState<Record<number, Trainer[]>>({});
  const [newTr, setNewTr] = useState({ name: "", role: "", exp: "", speciality: "", cert: "" });
  const [joinFlow, setJoinFlow] = useState<string | null>(null);
  const [jForm, setJForm] = useState<JForm>({ name: "", phone: "", email: "", plan: "monthly", startDate: "" });
  const [jLoading, setJLoading] = useState(false);
  const [form, setForm] = useState<GymForm>({ name: "IRON DISTRICT", tagline: "Train Hard. Live Strong.", type: "Bodybuilding", location: "Bengaluru, Karnataka", phone: "+91 98000 00000", email: "info@irondistrict.in", price: "1999", hours: "Mon–Sun 5am–11pm", description: "Bengaluru's most intense bodybuilding gym with competition-grade free weights, dedicated squat racks, and a community of serious lifters.", highlights: "Olympic barbells, Competition plates, Expert coaches, Nutrition bar" });
  const [selAmns, setSelAmns] = useState<string[]>(["Free Weights", "Cardio", "Locker Rooms", "Sauna"]);
  const [selTheme, setSelTheme] = useState("dark");

  // Create tab — custom trainers, equipment, pricing, reviews, gallery
  const [cTrainers, setCTrainers] = useState<Trainer[]>([]);
  const [cEquipment, setCEquipment] = useState<Equipment[]>([]);
  const [cGallery, setCGallery] = useState<{ id: number; photo: string; caption: string }[]>([]);
  const [cBeforeAfter, setCBeforeAfter] = useState<{ id: number; before: string; after: string; label: string }[]>([]);
  const [cReviews, setCReviews] = useState<{ id: number; name: string; rating: number; comment: string; date: string }[]>([]);
  const [newCReview, setNewCReview] = useState({ name: "", rating: 5, comment: "", date: "" });
  const [cFaq, setCFaq] = useState<{ id: number; q: string; a: string }[]>([
    { id: 1, q: "What are your membership options?", a: "We offer Monthly, Quarterly and Annual plans. Visit our pricing section for details." },
    { id: 2, q: "Is there a joining fee?", a: "No joining fee. Cancel anytime with 30 days notice." },
    { id: 3, q: "Do you offer personal training?", a: "Yes, certified personal trainers are available for one-on-one sessions." },
  ]);
  const [newFaq, setNewFaq] = useState({ q: "", a: "" });
  const [cPromo, setCPromo] = useState({ enabled: false, text: "🎉 First Month FREE for new members!", cta: "Claim Now", accent: "" });
  const [cTrial, setCTrial] = useState({ enabled: true, title: "Book a Free Trial Class", subtitle: "Experience our gym before committing" });
  const [cPlans, setCPlans] = useState([
    { id: 1, name: "Monthly", price: "1999", features: "Full gym access, Locker room, Free WiFi" },
    { id: 2, name: "Quarterly", price: "5399", features: "Full gym access, Locker room, Free WiFi, 1 PT session/month, Diet consultation" },
    { id: 3, name: "Annual", price: "19990", features: "Full gym access, Locker room, Free WiFi, 4 PT sessions/month, Diet plan, Guest passes ×2" },
  ]);
  const [newCTr, setNewCTr] = useState({ name: "", role: "", speciality: "", cert: "", exp: "", photo: null as string | null });
  const [newCEq, setNewCEq] = useState({ name: "", category: "", qty: "1", photo: null as string | null });
  const [generating, setGenerating] = useState(false);
  const [prevHtml, setPrevHtml] = useState("");
  const [sites, setSites] = useState<Site[]>([]);
  const [published, setPublished] = useState<Site[]>([]);
  const [selSite, setSelSite] = useState<Site | null>(null);
  const [selSiteMtab, setSelSiteMtab] = useState("website");
  const [viewing, setViewing] = useState<Site | null>(null);
  const [sharing, setSharing] = useState<Site | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiKey] = useState(import.meta.env.VITE_GROQ_KEY || "");
  const [siteAnalytics, setSiteAnalytics] = useState<Record<number, { views: number; joins: number }>>({});
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  const [onboarding, setOnboarding] = useState(() => !localStorage.getItem("dg_ob"));
  const [obStep, setObStep] = useState(0);
  const [viewingVersion, setViewingVersion] = useState<{ html: string; createdAt: string } | null>(null);
  const [versionSite, setVersionSite] = useState<Site | null>(null);
  const [sitesSearch, setSitesSearch] = useState("");
  const [sitesFilter, setSitesFilter] = useState("All");
  const [sitesPriceFilter, setSitesPriceFilter] = useState("All");

  // ── Auth ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    onAuthChange(u => setUser(u as { id: string; email?: string } | null));
    supabase.auth.getUser().then(({ data }) => setUser(data.user as { id: string; email?: string } | null));
  }, []);

  // Load sites from DB when user logs in
  useEffect(() => {
    if (!user || !supabase) return;
    loadSites().then(rows => {
      if (!rows.length) return;
      setSites(rows.map(r => ({
        id: r.id, name: r.name, tagline: r.tagline, type: r.type, location: r.location,
        price: r.price, theme: r.theme, slug: r.slug, url: r.url, html: r.html,
        createdAt: r.created_at || "", formData: r.form_data as GymForm,
        selAmns: r.sel_amns, cPlans: r.c_plans as { id: number; name: string; price: string; features: string }[],
        versions: r.versions as { html: string; createdAt: string }[],
      })));
      setSiteAnalytics(Object.fromEntries(rows.map(r => [r.id, { views: r.views || 0, joins: r.joins || 0 }])));
      setPublished(rows.filter(r => r.published).map(r => ({
        id: r.id, name: r.name, tagline: r.tagline, type: r.type, location: r.location,
        price: r.price, theme: r.theme, slug: r.slug, url: r.url, html: r.html, createdAt: r.created_at || "",
      })));
    });
  }, [user]);

  const handleAuth = async () => {
    setAuthErr(""); setAuthLoading(true);
    const fn = authMode === "login" ? signIn : signUp;
    const res = await fn(authEmail, authPass);
    setAuthLoading(false);
    if (res?.error) { setAuthErr(res.error.message); return; }
    setAuthModal(false); setAuthEmail(""); setAuthPass("");
  };

  // ── Subscription ──────────────────────────────────────────────────────
  const [subscription, setSubscription] = useState<{ plan: string; status: string; current_period_end: string } | null>(null);
  const [subModal, setSubModal] = useState(false);

  useEffect(() => {
    if (!user || !supabase) return;
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setSubscription(data as { plan: string; status: string; current_period_end: string }); });
  }, [user]);

  const handleUpgrade = async (plan: "pro" | "agency") => {
    try {
      const order = await createCheckout(plan);
      if (!order) return;
      // Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
      script.onload = () => {
        const rzp = new (window as unknown as { Razorpay: new (opts: object) => { open: () => void } }).Razorpay({
          key: order.key, amount: order.amount, currency: order.currency,
          name: "DeshGym", description: order.plan_name,
          order_id: order.order_id,
          handler: () => { setSubscription({ plan, status: "active", current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString() }); setSubModal(false); alert("🎉 Welcome to " + order.plan_name + "!"); },
          theme: { color: "#e8ff00" },
        });
        rzp.open();
      };
    } catch (e) { console.error(e); }
  };

  const th = THEMES.find(t => t.id === selTheme)!;
  const uf = (k: keyof GymForm, v: string) => setForm(f => ({ ...f, [k]: v }));
  const ta = (a: string) => setSelAmns(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const getEq = (id: number, type: string) => gymEq[id] || getEqDef(type);
  const effectiveGym = (g: Gym): Gym => ({ ...g, ...(gymOverrides[g.id] || {}) });
  const upEqPh = (id: number, type: string, eid: number, url: string) =>
    setGymEq(p => ({ ...p, [id]: getEq(id, type).map(e => e.id === eid ? { ...e, photo: url } : e) }));
  const delEq = (id: number, type: string, eid: number) =>
    setGymEq(p => ({ ...p, [id]: getEq(id, type).filter(e => e.id !== eid) }));
  const addEq = (id: number, type: string) => {
    if (!newEq.name.trim()) return;
    setGymEq(p => ({ ...p, [id]: [...getEq(id, type), { id: Date.now(), name: newEq.name, category: newEq.category || "General", qty: Number(newEq.qty) || 1, photo: null }] }));
    setNewEq({ name: "", category: "", qty: 1 });
  };
  const uplEq = (id: number, type: string, eid: number, file: File | null) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => upEqPh(id, type, eid, (e.target as FileReader).result as string);
    r.readAsDataURL(file);
  };

  const getTr = (id: number, type: string) => gymTr[id] || getTrDef(type);
  const delTr = (id: number, type: string, tid: number) =>
    setGymTr(p => ({ ...p, [id]: getTr(id, type).filter(t => t.id !== tid) }));
  const addTr = (id: number, type: string) => {
    if (!newTr.name.trim()) return;
    setGymTr(p => ({ ...p, [id]: [...getTr(id, type), { id: Date.now(), ...newTr, photo: null, rating: 5.0, sessions: 0 }] }));
    setNewTr({ name: "", role: "", exp: "", speciality: "", cert: "" });
  };
  const uplTr = (id: number, type: string, tid: number, file: File | null) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => setGymTr(p => ({ ...p, [id]: getTr(id, type).map(t => t.id === tid ? { ...t, photo: (e.target as FileReader).result as string } : t) }));
    r.readAsDataURL(file);
  };

  const publishToBrowse = (site: Site) => {
    setPublished(p => p.find(s => s.id === site.id) ? p : [site, ...p]);
  };

  const editSite = (site: Site) => {
    if (site.formData) setForm(site.formData);
    if (site.selAmns) setSelAmns(site.selAmns);
    if (site.cPlans) setCPlans(site.cPlans);
    setSelTheme(site.theme);
    setEditingSite(site);
    setPrevHtml(site.html);
    setTab("create");
  };

  const dupSite = (site: Site) => {
    const newId = Date.now();
    const s: Site = { ...site, id: newId, name: site.name + " (Copy)", slug: slugify(site.name + "-copy"), url: siteUrl(site.name + "-copy"), createdAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) };
    setSites(p => [s, ...p]);
    setSiteAnalytics(a => ({ ...a, [newId]: { views: 0, joins: 0 } }));
  };

  const openViewer = (site: Site) => {
    setViewing(site);
    setSiteAnalytics(a => ({ ...a, [site.id]: { views: (a[site.id]?.views || 0) + 1, joins: a[site.id]?.joins || 0 } }));
  };

  const openJoin = () => { setJoinFlow("form"); setJForm({ name: "", phone: "", email: "", plan: "monthly", startDate: "" }); };
  const submitJoin = () => {
    if (!jForm.name || !jForm.phone) return;
    setJLoading(true);
    setTimeout(() => { setJLoading(false); setJoinFlow("success"); }, 1500);
  };

  const generate = async () => {
    if (!form.name || !apiKey.trim()) return;
    setGenerating(true);
    setPrevHtml("");
    try {
      const eqData = cEquipment.length ? cEquipment : getEqDef(form.type);
      const trData = cTrainers.length ? cTrainers : getTrDef(form.type);

      // ── Pre-built sections injected directly ──────────────────────────

      // Stats bar
      const avgRating = trData.length ? (trData.reduce((s, t) => s + t.rating, 0) / trData.length).toFixed(1) : "5.0";
      const totalSessions = trData.reduce((s, t) => s + t.sessions, 0);
      const statsSection = `<section style="padding:40px 2rem;background:#0d0d0d;border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;"><div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;text-align:center;">${[
        ["⭐", avgRating, "Avg Rating"],
        [trData.length > 0 ? String(trData.length) : "10+", "", "Expert Trainers"],
        [eqData.length > 0 ? String(eqData.length) : "50+", "", "Equipment Types"],
        [totalSessions > 0 ? totalSessions.toLocaleString() : "10,000+", "", "Sessions Completed"],
        [selAmns.length > 0 ? String(selAmns.length) : "8+", "", "Amenities"],
      ].map(([val, sub, lbl]) => `<div><div style="font-family:'Bebas Neue',sans-serif;font-size:2.5rem;letter-spacing:2px;color:${th.accent};line-height:1;">${val}${sub}</div><div style="font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin-top:4px;">${lbl}</div></div>`).join("")}</div></section>`;

      // Gallery
      const gallerySection = cGallery.length > 0 ? `<section id="gallery" style="padding:80px 2rem;background:#0d0d0d;"><div style="max-width:1100px;margin:0 auto;"><p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;">Inside Look</p><h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);letter-spacing:2px;color:#f0f0f0;margin-bottom:40px;">GALLERY</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">${cGallery.map(g => `<div style="border-radius:10px;overflow:hidden;position:relative;aspect-ratio:4/3;"><img src="${g.photo}" alt="${g.caption||""}" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">${g.caption ? `<div style="position:absolute;bottom:0;left:0;right:0;padding:10px 14px;background:linear-gradient(transparent,rgba(0,0,0,.8));font-family:'Barlow Condensed',sans-serif;font-size:.8rem;font-weight:700;color:#f0f0f0;">${g.caption}</div>` : ""}</div>`).join("")}</div></div></section>` : "";

      const equipmentSection = `<section id="equipment" style="padding:80px 2rem;background:${th.bg};"><div style="max-width:1100px;margin:0 auto;"><p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;">What We Have</p><h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);letter-spacing:2px;color:#f0f0f0;margin-bottom:40px;">OUR EQUIPMENT</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;">${eqData.map(e => `<div style="background:#161616;border:1px solid #222;border-top:3px solid ${th.accent};border-radius:10px;overflow:hidden;transition:transform .2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'">${e.photo ? `<img src="${e.photo}" alt="${e.name}" style="width:100%;height:120px;object-fit:cover;display:block;">` : `<div style="height:80px;display:flex;align-items:center;justify-content:center;font-size:2rem;">🏋️</div>`}<div style="padding:12px 14px;"><div style="font-family:'Barlow Condensed',sans-serif;font-size:.95rem;font-weight:700;color:#f0f0f0;margin-bottom:4px;">${e.name}</div><div style="font-size:.72rem;color:#555;">${e.qty} units · ${e.category}</div></div></div>`).join("")}</div></div></section>`;

      const trainersSection = `<section id="trainers" style="padding:80px 2rem;background:#0d0d0d;"><div style="max-width:1100px;margin:0 auto;"><p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;">The Team</p><h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);letter-spacing:2px;color:#f0f0f0;margin-bottom:40px;">MEET THE COACHES</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;">${trData.map(t => `<div style="background:#161616;border:1px solid #222;border-radius:12px;overflow:hidden;">${t.photo ? `<img src="${t.photo}" alt="${t.name}" style="width:100%;height:200px;object-fit:cover;display:block;">` : `<div style="height:90px;background:linear-gradient(135deg,#1a1a1a,#222);display:flex;align-items:center;justify-content:center;"><div style="width:64px;height:64px;border-radius:50%;background:${th.accent};display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1.5rem;color:#000;">${t.name.split(" ").map((n: string) => n[0]).join("")}</div></div>`}<div style="padding:16px;"><div style="font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:1px;color:#f0f0f0;margin-bottom:2px;">${t.name}</div><div style="font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;">${t.role}</div><div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;">${[t.speciality && `🎯 ${t.speciality}`, t.cert && `🏅 ${t.cert}`, t.exp && `⏱ ${t.exp}`].filter(Boolean).map(tag => `<span style="font-size:.65rem;font-family:'Barlow Condensed',sans-serif;font-weight:600;padding:2px 8px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid #333;color:#888;">${tag}</span>`).join("")}</div><div style="font-size:.72rem;color:#555;">⭐ ${t.rating}${t.sessions > 0 ? ` · ${t.sessions.toLocaleString()} sessions` : ""}</div></div></div>`).join("")}</div></div></section>`;

      const pricingSection = `<section id="pricing" style="padding:80px 2rem;background:${th.bg};"><div style="max-width:900px;margin:0 auto;text-align:center;"><p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;">Membership</p><h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);letter-spacing:2px;color:#f0f0f0;margin-bottom:50px;">CHOOSE YOUR PLAN</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;text-align:left;">${cPlans.map((p, i) => `<div style="background:${i===1?"rgba(232,255,0,.05)":"#161616"};border:${i===1?`2px solid ${th.accent}`:"1px solid #222"};border-radius:12px;padding:28px 22px;position:relative;">${i===1?`<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${th.accent};color:#000;font-family:'Barlow Condensed',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:1.5px;padding:3px 14px;border-radius:20px;">POPULAR</div>`:""}<div style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${i===1?th.accent:"#555"};margin-bottom:12px;">${p.name}</div><div style="font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:1px;color:#f0f0f0;line-height:1;">₹${p.price||"—"}</div><div style="font-size:.72rem;color:#555;margin-bottom:20px;">/${p.name.toLowerCase()}</div><div style="margin-bottom:22px;">${p.features.split(",").map((f: string)=>`<div style="font-size:.78rem;color:#aaa;padding:5px 0;border-bottom:1px solid #1a1a1a;display:flex;gap:8px;"><span style="color:${th.accent};">✓</span>${f.trim()}</div>`).join("")}</div><button onclick="document.getElementById('join').scrollIntoView({behavior:'smooth'})" style="width:100%;padding:12px;border-radius:7px;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;background:${i===1?th.accent:"transparent"};color:${i===1?"#000":th.accent};border:${i===1?"none":`1.5px solid ${th.accent}`};">GET STARTED</button></div>`).join("")}</div></div></section>`;

      const ownerPhone = (form.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "91");
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
      const siteIdForLead = sites.find(s => s.name === form.name)?.id || Date.now();
      const leadApiCall = supabaseUrl ? `fetch('${supabaseUrl}/functions/v1/send-join-email',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer ${supabaseKey}'},body:JSON.stringify({site_id:${siteIdForLead},name:name,phone:phone,email:email,plan:plan})}).catch(()=>{});` : "";

      const joinSection = `<section id="join" style="padding:80px 2rem;background:#0d0d0d;"><div style="max-width:560px;margin:0 auto;"><p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;text-align:center;">Enroll Today</p><h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);letter-spacing:2px;color:#f0f0f0;margin-bottom:16px;text-align:center;">JOIN NOW</h2><p style="text-align:center;font-size:.8rem;color:#555;margin-bottom:30px;">No joining fee · Cancel anytime · WhatsApp confirmation</p><div id="plan-tabs" style="display:grid;grid-template-columns:repeat(${cPlans.length},1fr);gap:8px;margin-bottom:24px;">${cPlans.map((p,i)=>`<div onclick="document.querySelectorAll('.jpt').forEach(x=>x.style.borderColor='#222');this.style.borderColor='${th.accent}';document.getElementById('plan-sel').value='${p.name}${p.price?` — ₹${p.price}`:''}'" class="jpt" style="padding:12px 8px;border-radius:8px;cursor:pointer;text-align:center;border:${i===1?`2px solid ${th.accent}`:'1px solid #222'};background:${i===1?`rgba(232,255,0,.05)`:'#161616'};transition:border-color .15s;"><div style="font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${i===1?th.accent:'#555'};margin-bottom:4px;">${p.name}</div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:1px;color:#f0f0f0;">₹${p.price||'—'}</div></div>`).join('')}</div><form id="join-form" onsubmit="event.preventDefault();var f=this;var name=f.name.value;var phone=f.phone.value;var email=f.email.value;var plan=document.getElementById('plan-sel').value;var msg=encodeURIComponent('🏋️ New Member Request!\\n\\nGym: ${form.name}\\nName: '+name+'\\nPhone: '+phone+'\\nEmail: '+(email||'—')+'\\nPlan: '+plan+'\\n\\nPlease confirm membership.');${ownerPhone ? `window.open('https://wa.me/${ownerPhone}?text='+msg,'_blank');` : ""}${leadApiCall}f.style.display='none';document.getElementById('join-success').style.display='flex';" style="display:flex;flex-direction:column;gap:12px;"><input name="name" required placeholder="Full Name *" style="padding:13px 16px;background:#161616;border:1px solid #222;border-radius:8px;color:#f0f0f0;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none;" onfocus="this.style.borderColor='${th.accent}'" onblur="this.style.borderColor='#222'"/><input name="phone" required placeholder="WhatsApp / Phone *" style="padding:13px 16px;background:#161616;border:1px solid #222;border-radius:8px;color:#f0f0f0;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none;" onfocus="this.style.borderColor='${th.accent}'" onblur="this.style.borderColor='#222'"/><input name="email" type="email" placeholder="Email Address" style="padding:13px 16px;background:#161616;border:1px solid #222;border-radius:8px;color:#f0f0f0;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none;" onfocus="this.style.borderColor='${th.accent}'" onblur="this.style.borderColor='#222'"/><input id="plan-sel" name="plan" readonly placeholder="Select a plan above" value="${cPlans[0]?.name||''}" style="padding:13px 16px;background:#161616;border:1px solid #222;border-radius:8px;color:#f0f0f0;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none;cursor:pointer;"/><input name="date" type="date" style="padding:13px 16px;background:#161616;border:1px solid #222;border-radius:8px;color:#f0f0f0;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none;" onfocus="this.style.borderColor='${th.accent}'" onblur="this.style.borderColor='#222'"/><button type="submit" style="padding:16px;border-radius:8px;cursor:pointer;font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:2px;background:${th.accent};color:#000;border:none;margin-top:6px;">CONFIRM MEMBERSHIP</button></form><div id="join-success" style="display:none;flex-direction:column;align-items:center;text-align:center;padding:40px 20px;"><div style="width:72px;height:72px;border-radius:50%;background:rgba(232,255,0,.12);border:2px solid ${th.accent};display:flex;align-items:center;justify-content:center;font-size:2rem;margin-bottom:20px;">✓</div><div style="font-family:'Bebas Neue',sans-serif;font-size:2.5rem;letter-spacing:2px;color:${th.accent};margin-bottom:8px;">YOU'RE IN!</div><div style="font-size:.9rem;color:#888;line-height:1.6;">Welcome to <strong style="color:#f0f0f0;">${form.name}</strong>.<br/>We'll WhatsApp you within 2 hours.</div></div></div></section>`;

      // Reviews
      const reviewsData = cReviews.length > 0 ? cReviews : [];
      const overallRating = reviewsData.length ? (reviewsData.reduce((s, r) => s + r.rating, 0) / reviewsData.length).toFixed(1) : null;
      const reviewsSection = reviewsData.length > 0 ? `<section id="reviews" style="padding:80px 2rem;background:${th.bg};"><div style="max-width:1100px;margin:0 auto;"><p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;">What Members Say</p><div style="display:flex;align-items:flex-end;gap:20px;margin-bottom:40px;flex-wrap:wrap;"><h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);letter-spacing:2px;color:#f0f0f0;line-height:1;">REVIEWS</h2><div style="display:flex;align-items:center;gap:10px;padding-bottom:8px;"><span style="font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:${th.accent};">${overallRating}</span><div><div style="color:#f5c518;font-size:1.1rem;letter-spacing:2px;">${"★".repeat(Math.round(Number(overallRating)))}${"☆".repeat(5-Math.round(Number(overallRating)))}</div><div style="font-size:.72rem;color:#555;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:1px;">${reviewsData.length} REVIEWS</div></div></div></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">${reviewsData.map(r=>`<div style="background:#161616;border:1px solid #222;border-radius:12px;padding:22px;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><div style="font-family:'Barlow Condensed',sans-serif;font-size:.9rem;font-weight:700;color:#f0f0f0;">${r.name}</div><div style="color:#f5c518;font-size:.9rem;">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</div></div><p style="font-size:.85rem;color:#888;line-height:1.6;margin-bottom:10px;">"${r.comment}"</p>${r.date?`<div style="font-size:.68rem;color:#444;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:1px;">${r.date}</div>`:""}</div>`).join("")}</div></div></section>` : "";

      // Before/After
      const beforeAfterSection = cBeforeAfter.length > 0 ? `<section id="transformations" style="padding:80px 2rem;background:#0d0d0d;"><div style="max-width:1100px;margin:0 auto;"><p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;">Real Results</p><h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);letter-spacing:2px;color:#f0f0f0;margin-bottom:40px;">TRANSFORMATIONS</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;">${cBeforeAfter.map(t=>`<div style="background:#161616;border:1px solid #222;border-radius:12px;overflow:hidden;"><div style="display:grid;grid-template-columns:1fr 1fr;"><div style="position:relative;"><img src="${t.before}" alt="Before" style="width:100%;height:220px;object-fit:cover;display:block;filter:grayscale(40%);"><div style="position:absolute;bottom:0;left:0;right:0;padding:6px 10px;background:rgba(0,0,0,.7);font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#888;">BEFORE</div></div><div style="position:relative;"><img src="${t.after}" alt="After" style="width:100%;height:220px;object-fit:cover;display:block;"><div style="position:absolute;bottom:0;left:0;right:0;padding:6px 10px;background:rgba(0,0,0,.7);font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${th.accent};">AFTER</div></div></div>${t.label?`<div style="padding:14px 16px;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:700;color:#f0f0f0;">${t.label}</div>`:""}</div>`).join("")}</div></div></section>` : "";

      // Google Maps embed using location
      const mapQuery = encodeURIComponent((form.location || "India") + " gym");
      const mapsSection = `<section id="map" style="padding:0;background:#0d0d0d;"><div style="max-width:1100px;margin:0 auto;padding:80px 2rem 0;"><p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;">How To Find Us</p><h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);letter-spacing:2px;color:#f0f0f0;margin-bottom:30px;">LOCATION</h2></div><div style="width:100%;height:400px;filter:grayscale(80%) invert(90%) contrast(90%);"><iframe width="100%" height="100%" frameborder="0" style="border:0;display:block;" src="https://maps.google.com/maps?q=${mapQuery}&output=embed" allowfullscreen loading="lazy"></iframe></div></section>`;

      // WhatsApp floating button
      const waPhone = (form.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "91");
      const waFloat = waPhone ? `<a href="https://wa.me/${waPhone}?text=${encodeURIComponent(`Hi! I found ${form.name} on DeshGym and I'm interested in joining.`)}" target="_blank" style="position:fixed;bottom:28px;right:28px;z-index:999;width:58px;height:58px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,211,102,.4);transition:transform .2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L0 24l6.335-1.508A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.51-5.17-1.4l-.37-.22-3.76.895.952-3.668-.242-.378A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg></a>` : "";

      // FAQ accordion
      const faqSection = cFaq.length > 0 ? `<section id="faq" style="padding:80px 2rem;background:${th.bg};"><div style="max-width:800px;margin:0 auto;"><p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;">Got Questions?</p><h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);letter-spacing:2px;color:#f0f0f0;margin-bottom:40px;">FAQ</h2><div style="display:flex;flex-direction:column;gap:10px;">${cFaq.map((f,i)=>`<div style="background:#161616;border:1px solid #222;border-radius:10px;overflow:hidden;"><button onclick="var c=this.nextElementSibling;var a=this.querySelector('.fa');c.style.display=c.style.display==='block'?'none':'block';a.style.transform=c.style.display==='block'?'rotate(45deg)':'rotate(0)';" style="width:100%;padding:18px 20px;background:none;border:none;color:#f0f0f0;font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;"><span>${f.q}</span><span class="fa" style="font-size:1.4rem;color:${th.accent};transition:transform .2s;line-height:1;">+</span></button><div style="display:${i===0?'block':'none'};padding:0 20px 18px;font-size:.88rem;color:#888;line-height:1.7;">${f.a}</div></div>`).join("")}</div></div></section>` : "";

      // Trial class booking
      const trialSection = cTrial.enabled ? `<section id="trial" style="padding:80px 2rem;background:#0d0d0d;"><div style="max-width:560px;margin:0 auto;text-align:center;"><p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:10px;">Try Before You Commit</p><h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,4vw,3.5rem);letter-spacing:2px;color:#f0f0f0;margin-bottom:10px;">${cTrial.title}</h2><p style="font-size:.88rem;color:#555;margin-bottom:30px;">${cTrial.subtitle}</p><form id="trial-form" onsubmit="event.preventDefault();var f=this;var name=f.tname.value;var phone=f.tphone.value;var date=f.tdate.value;var time=f.ttime.value;${waPhone?`var msg=encodeURIComponent('🎯 Trial Class Request!\\n\\nGym: ${form.name}\\nName: '+name+'\\nPhone: '+phone+'\\nDate: '+date+'\\nTime: '+time);window.open('https://wa.me/${waPhone}?text='+msg,'_blank');`:''}f.style.display='none';document.getElementById('trial-success').style.display='flex';" style="display:flex;flex-direction:column;gap:12px;text-align:left;"><input name="tname" required placeholder="Your Name *" style="padding:13px 16px;background:#161616;border:1px solid #222;border-radius:8px;color:#f0f0f0;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none;" onfocus="this.style.borderColor='${th.accent}'" onblur="this.style.borderColor='#222'"/><input name="tphone" required placeholder="WhatsApp Number *" style="padding:13px 16px;background:#161616;border:1px solid #222;border-radius:8px;color:#f0f0f0;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none;" onfocus="this.style.borderColor='${th.accent}'" onblur="this.style.borderColor='#222'"/><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"><input name="tdate" type="date" required style="padding:13px 16px;background:#161616;border:1px solid #222;border-radius:8px;color:#f0f0f0;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none;" onfocus="this.style.borderColor='${th.accent}'" onblur="this.style.borderColor='#222'"/><select name="ttime" style="padding:13px 16px;background:#161616;border:1px solid #222;border-radius:8px;color:#f0f0f0;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none;">${["6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","5:00 PM","6:00 PM","7:00 PM","8:00 PM"].map(t=>`<option>${t}</option>`).join("")}</select></div><button type="submit" style="padding:16px;border-radius:8px;cursor:pointer;font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:2px;background:${th.accent};color:#000;border:none;">BOOK FREE TRIAL</button></form><div id="trial-success" style="display:none;flex-direction:column;align-items:center;padding:30px 20px;"><div style="width:64px;height:64px;border-radius:50%;background:rgba(232,255,0,.12);border:2px solid ${th.accent};display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin-bottom:16px;">✓</div><div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:2px;color:${th.accent};margin-bottom:8px;">BOOKED!</div><div style="font-size:.88rem;color:#888;">We'll confirm your trial class via WhatsApp shortly.</div></div></div></section>` : "";

      // Promo banner
      const promoBanner = cPromo.enabled ? `<div style="background:${cPromo.accent||th.accent};color:#000;padding:12px 2rem;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:.9rem;font-weight:700;letter-spacing:1px;display:flex;align-items:center;justify-content:center;gap:16px;">${cPromo.text}<button onclick="document.getElementById('join').scrollIntoView({behavior:'smooth'})" style="padding:6px 18px;background:#000;color:${cPromo.accent||th.accent};border:none;border-radius:4px;font-family:'Barlow Condensed',sans-serif;font-size:.8rem;font-weight:700;letter-spacing:1px;cursor:pointer;">${cPromo.cta}</button></div>` : "";

      const prompt = `Write ONLY the inner content (no HTML/head/body tags) for a gym website with these 4 sections. Return raw HTML only, no markdown, no explanations.

GYM: ${form.name} | ${form.type} | ${form.location || "India"}
Tagline: ${form.tagline || "Train Hard. Live Strong."}
Description: ${form.description || "A world-class fitness facility."}
Highlights: ${form.highlights || "Expert trainers, modern equipment"}
Amenities: ${selAmns.length ? selAmns.join(", ") : "Free Weights, Cardio, Sauna, Locker Rooms"}
Accent color: ${th.accent}

Section 1 — HERO inner content only (no section tag):
- A <p> label "EST. 2024" styled uppercase tiny accent color
- <h1> with gym name in huge Bebas Neue, one word per line if long
- <p> tagline
- Two buttons: "JOIN NOW" onclick scrolls to #join, "VIEW PLANS" onclick scrolls to #pricing

Section 2 — ABOUT inner content only (no section tag):
- Left col: 4 stat divs (Members, Trainers, Equipment, Years) with big numbers
- Right col: 2-3 sentences about the gym, then highlights as checklist items with ✓

Section 3 — AMENITIES inner content only (no section tag):
- Responsive grid of cards, each with a relevant emoji + amenity name

Section 4 — CONTACT inner content only (no section tag):
- Left: address block, phone, email, WhatsApp button linking to wa.me
- Right: hours table (Mon-Fri, Sat-Sun rows)

Wrap each section's content in: <div id="hero-inner">...</div>, <div id="about-inner">...</div>, <div id="amenities-inner">...</div>, <div id="contact-inner">...</div>
Use inline styles only. Dark theme: background #161616, text #f0f0f0, accent ${th.accent}.`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey.trim()}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 4096, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      let aiContent = data.choices?.[0]?.message?.content || "";
      aiContent = aiContent.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

      // Extract AI sections
      const getInner = (id: string) => {
        const m = aiContent.match(new RegExp(`<div id="${id}-inner">([\\s\\S]*?)<\\/div>`, "i"));
        return m ? m[1] : "";
      };
      const heroInner = getInner("hero") || `<p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:16px;">EST. 2024</p><h1 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(4rem,12vw,10rem);letter-spacing:3px;line-height:.9;margin-bottom:24px;color:#f0f0f0;">${form.name}</h1><p style="font-size:1.1rem;color:#888;max-width:500px;line-height:1.6;margin-bottom:36px;">${form.tagline || "Train Hard. Live Strong."}</p><div style="display:flex;gap:14px;flex-wrap:wrap;"><button onclick="document.getElementById('join').scrollIntoView({behavior:'smooth'})" style="padding:16px 36px;background:${th.accent};color:#000;border:none;border-radius:6px;font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:2px;cursor:pointer;">JOIN NOW</button><button onclick="document.getElementById('pricing').scrollIntoView({behavior:'smooth'})" style="padding:16px 36px;background:transparent;color:${th.accent};border:1.5px solid ${th.accent};border-radius:6px;font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:2px;cursor:pointer;">VIEW PLANS</button></div>`;
      const aboutInner = getInner("about") || `<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">${[["500+","Members"],["10+","Trainers"],["100+","Equipment"],["5+","Years"]].map(([n,l])=>`<div style="text-align:center;padding:20px;background:#161616;border-radius:10px;border:1px solid #222;"><div style="font-family:'Bebas Neue',sans-serif;font-size:3rem;color:${th.accent};">${n}</div><div style="font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;">${l}</div></div>`).join("")}</div><div><p style="font-size:.95rem;color:#aaa;line-height:1.8;margin-bottom:20px;">${form.description || "A world-class fitness facility built for serious athletes."}</p>${(form.highlights||"Expert trainers,Modern equipment,Premium facilities").split(",").map(h=>`<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;font-size:.88rem;color:#ccc;"><span style="color:${th.accent};font-size:1rem;">✓</span>${h.trim()}</div>`).join("")}</div></div>`;
      const amenitiesInner = getInner("amenities") || `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px;">${(selAmns.length ? selAmns : ["Free Weights","Cardio","Sauna","Locker Rooms","WiFi","Parking"]).map(a=>`<div style="background:#161616;border:1px solid #222;border-radius:10px;padding:20px 14px;text-align:center;transition:border-color .2s;" onmouseover="this.style.borderColor='${th.accent}'" onmouseout="this.style.borderColor='#222'"><div style="font-size:1.8rem;margin-bottom:8px;">💪</div><div style="font-family:'Barlow Condensed',sans-serif;font-size:.82rem;font-weight:700;color:#f0f0f0;">${a}</div></div>`).join("")}</div>`;
      const contactInner = getInner("contact") || `<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;"><div><div style="font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:20px;">Get In Touch</div><div style="font-size:.9rem;color:#aaa;line-height:2;">📍 ${form.location||"India"}<br/>📞 ${form.phone||"+91 98000 00000"}<br/>✉️ ${form.email||"info@gym.com"}</div><a href="https://wa.me/${(form.phone||"919800000000").replace(/[^0-9]/g,"")}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;margin-top:20px;padding:12px 24px;background:#25d366;color:#fff;border-radius:6px;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:1px;">💬 WhatsApp Us</a></div><div><div style="font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:20px;">Opening Hours</div><table style="width:100%;border-collapse:collapse;">${[["Mon – Fri",form.hours||"5:00 AM – 11:00 PM"],["Saturday","6:00 AM – 10:00 PM"],["Sunday","7:00 AM – 9:00 PM"]].map(([d,h],i)=>`<tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:10px 0;font-size:.85rem;color:#aaa;">${d}</td><td style="padding:10px 0;font-size:.85rem;color:${i===0?th.accent:"#aaa"};text-align:right;font-weight:${i===0?"700":"400"};">${h}</td></tr>`).join("")}</table></div></div>`;

      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${form.name}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@400;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}html{scroll-behavior:smooth;}body{background:${th.bg};color:#f0f0f0;font-family:'Barlow',sans-serif;}a{text-decoration:none;color:inherit;}nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,10,10,.95);backdrop-filter:blur(12px);border-bottom:1px solid #1a1a1a;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:64px;}nav .logo{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:3px;color:${th.accent};}nav .links{display:flex;gap:4px;}nav .links a{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:7px 14px;border-radius:4px;color:#666;transition:color .2s;}nav .links a:hover{color:#f0f0f0;}nav .cta{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:9px 20px;border-radius:5px;background:${th.accent};color:#000;border:none;cursor:pointer;transition:opacity .2s;}nav .cta:hover{opacity:.87;}section{padding:100px 2rem;}.inner{max-width:1100px;margin:0 auto;}.sec-label{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${th.accent};margin-bottom:12px;}.sec-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4.5rem);letter-spacing:2px;color:#f0f0f0;margin-bottom:40px;line-height:1;}#hero{min-height:100vh;display:flex;align-items:center;padding-top:64px;background:${th.bg};position:relative;overflow:hidden;}#hero::before{content:'${form.name.split(" ")[0]}';position:absolute;right:-20px;top:50%;transform:translateY(-50%);font-family:'Bebas Neue',sans-serif;font-size:30vw;color:rgba(255,255,255,.02);pointer-events:none;line-height:1;}#about{background:#0d0d0d;}#amenities{background:${th.bg};}#contact{background:#0d0d0d;}footer{background:#080808;border-top:1px solid #1a1a1a;padding:50px 2rem 30px;}.footer-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;}.footer-logo{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:3px;color:${th.accent};}.footer-links{display:flex;gap:20px;flex-wrap:wrap;}.footer-links a{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#444;transition:color .2s;}.footer-links a:hover{color:#f0f0f0;}.footer-copy{width:100%;text-align:center;font-size:.72rem;color:#333;margin-top:30px;padding-top:20px;border-top:1px solid #111;}</style></head><body>
${promoBanner}
<nav><span class="logo">${form.name}</span><div class="links"><a onclick="document.getElementById('about').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">About</a><a onclick="document.getElementById('amenities').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">Amenities</a><a onclick="document.getElementById('equipment').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">Equipment</a><a onclick="document.getElementById('trainers').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">Trainers</a><a onclick="document.getElementById('pricing').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">Pricing</a>${cTrial.enabled?'<a onclick="document.getElementById(\'trial\').scrollIntoView({behavior:\'smooth\'})" style="cursor:pointer;">Free Trial</a>':''}${cReviews.length > 0 ? '<a onclick="document.getElementById(\'reviews\').scrollIntoView({behavior:\'smooth\'})" style="cursor:pointer;">Reviews</a>' : ''}${cGallery.length > 0 ? '<a onclick="document.getElementById(\'gallery\').scrollIntoView({behavior:\'smooth\'})" style="cursor:pointer;">Gallery</a>' : ''}${cBeforeAfter.length > 0 ? '<a onclick="document.getElementById(\'transformations\').scrollIntoView({behavior:\'smooth\'})" style="cursor:pointer;">Results</a>' : ''}${cFaq.length > 0 ? '<a onclick="document.getElementById(\'faq\').scrollIntoView({behavior:\'smooth\'})" style="cursor:pointer;">FAQ</a>' : ''}<a onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">Contact</a></div><button class="cta" onclick="document.getElementById('join').scrollIntoView({behavior:'smooth'})">Join Now</button></nav>
<section id="hero"><div class="inner">${heroInner}</div></section>
<section id="about"><div class="inner"><p class="sec-label">Our Story</p><h2 class="sec-title">ABOUT US</h2>${aboutInner}</div></section>
<section id="amenities"><div class="inner"><p class="sec-label">Facilities</p><h2 class="sec-title">AMENITIES</h2>${amenitiesInner}</div></section>
${statsSection}
${equipmentSection}
${trainersSection}
${cGallery.length > 0 ? gallerySection : ""}
${pricingSection}
${cTrial.enabled ? trialSection : ""}
${cReviews.length > 0 ? reviewsSection : ""}
${cBeforeAfter.length > 0 ? beforeAfterSection : ""}
${cFaq.length > 0 ? faqSection : ""}
${joinSection}
<section id="contact"><div class="inner"><p class="sec-label">Find Us</p><h2 class="sec-title">CONTACT</h2>${contactInner}</div></section>
${mapsSection}
<footer><div class="footer-inner"><span class="footer-logo">${form.name}</span><div class="footer-links"><a onclick="document.getElementById('about').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">About</a><a onclick="document.getElementById('equipment').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">Equipment</a><a onclick="document.getElementById('trainers').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">Trainers</a><a onclick="document.getElementById('pricing').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">Pricing</a><a onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;">Contact</a></div><div class="footer-copy">© ${new Date().getFullYear()} ${form.name}. All rights reserved. · ${form.location || "India"}</div></div></footer>
${waFloat}
</body></html>`;
      setPrevHtml(html);
      if (html) {
        const siteId = editingSite ? editingSite.id : Date.now();
        const s: Site = {
          id: siteId, name: form.name, tagline: form.tagline, type: form.type,
          location: form.location || "India", price: form.price, theme: selTheme,
          slug: slugify(form.name), url: siteUrl(form.name),
          createdAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }), html,
          formData: { ...form }, selAmns: [...selAmns], cPlans: cPlans.map(p => ({ ...p })),
        };
        if (editingSite) {
          const updated = {
            ...s,
            versions: [...(editingSite.versions || []), { html: editingSite.html, createdAt: editingSite.createdAt }].slice(-10)
          };
          setSites(p => p.map(x => x.id === editingSite.id ? updated : x));
          setPublished(p => p.map(x => x.id === editingSite.id ? updated : x));
          if (user) saveSite({ ...updated, form_data: updated.formData, sel_amns: updated.selAmns, c_plans: updated.cPlans, versions: updated.versions } as Parameters<typeof saveSite>[0]);

          setEditingSite(null);
        } else {
          setSites(p => [s, ...p]);
          setSiteAnalytics(a => ({ ...a, [siteId]: { views: 0, joins: 0 } }));
          if (user) saveSite({ ...s, form_data: s.formData, sel_amns: s.selAmns, c_plans: s.cPlans } as Parameters<typeof saveSite>[0]);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setPrevHtml(`<html><body style="background:#111;color:#fff;padding:40px;font-family:sans-serif;"><h1>Error</h1><p>${msg}</p></body></html>`);
    }
    setGenerating(false);
  };

  const dlSite = (s: Site) => {
    const b = new Blob([s.html], { type: "text/html" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u; a.download = `${s.name}-website.html`; a.click();
    URL.revokeObjectURL(u);
  };

  const exportZip = async (sitesToExport: Site[]) => {
    // Build a simple ZIP manually using stored files as data URIs
    // We'll create a single HTML file per site and bundle as a self-contained archive
    // Since we can't use JSZip without installing, we'll download each as individual files
    // with a manifest HTML index
    const index = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DeshGym Sites Export</title>
    <style>body{font-family:sans-serif;background:#0a0a0a;color:#f0f0f0;padding:40px;max-width:800px;margin:0 auto;}
    h1{color:#e8ff00;font-size:2rem;margin-bottom:8px;}p{color:#555;margin-bottom:30px;}
    .site{background:#161616;border:1px solid #222;border-radius:10px;padding:20px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}
    .sname{font-size:1.1rem;font-weight:700;}
    .smeta{font-size:.8rem;color:#555;margin-top:4px;}
    a{color:#e8ff00;text-decoration:none;padding:8px 16px;border:1px solid #e8ff00;border-radius:5px;font-size:.8rem;}
    </style></head><body>
    <h1>DESHGYM EXPORT</h1>
    <p>${sitesToExport.length} website${sitesToExport.length !== 1 ? "s" : ""} exported on ${new Date().toLocaleDateString("en-IN")}</p>
    ${sitesToExport.map(s => `<div class="site"><div><div class="sname">${s.name}</div><div class="smeta">${s.type} · ${s.location} · ${s.createdAt}</div></div><a href="${s.slug}.html" download>Download</a></div>`).join("")}
    </body></html>`;
    // Download index
    const ib = new Blob([index], { type: "text/html" });
    const ia = document.createElement("a"); ia.href = URL.createObjectURL(ib); ia.download = "deshgym-export-index.html"; ia.click();
    // Download each site with a small delay
    for (let i = 0; i < sitesToExport.length; i++) {
      await new Promise(r => setTimeout(r, 300 * i));
      dlSite(sitesToExport[i]);
    }
  };

  const fSites = sites.filter(s =>
    (!sitesSearch || s.name.toLowerCase().includes(sitesSearch.toLowerCase()) || s.location.toLowerCase().includes(sitesSearch.toLowerCase())) &&
    (sitesFilter === "All" || s.type === sitesFilter) &&
    (sitesPriceFilter === "All" ||
      (sitesPriceFilter === "<2000" && Number(s.price) < 2000) ||
      (sitesPriceFilter === "2000-4000" && Number(s.price) >= 2000 && Number(s.price) <= 4000) ||
      (sitesPriceFilter === ">4000" && Number(s.price) > 4000))
  );

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOn = (plat: string, s: Site) => {
    const u = encodeURIComponent(s.url);
    const t = encodeURIComponent(`Check out ${s.name} gym website! 💪`);
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${t}%20${u}`,
      twitter: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      telegram: `https://t.me/share/url?url=${u}&text=${t}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      instagram: `https://www.instagram.com/`,
      email: `mailto:?subject=${encodeURIComponent(s.name)}&body=${t}%20${u}`,
    };
    window.open(links[plat], "_blank");
  };

  const FILTERS = ["All", "Powerlifting", "CrossFit & Functional", "Yoga & Pilates", "Bodybuilding", "MMA & Boxing", "Boutique Fitness"];
  const [priceFilter, setPriceFilter] = useState("All");
  const PRICE_FILTERS = [["All","All"],["Under ₹2000","<2000"],["₹2000–₹4000","2000-4000"],["Above ₹4000",">4000"]];
  const matchPrice = (price: number) => {
    if (priceFilter === "All") return true;
    if (priceFilter === "<2000") return price < 2000;
    if (priceFilter === "2000-4000") return price >= 2000 && price <= 4000;
    if (priceFilter === ">4000") return price > 4000;
    return true;
  };
  const fGyms = GYM_DATA.filter(g =>
    (filter === "All" || g.type === filter) &&
    matchPrice(g.price) &&
    (!search || g.name.toLowerCase().includes(search.toLowerCase()) || g.location.toLowerCase().includes(search.toLowerCase()))
  );
  const SHARE_PLATFORMS = [
    { key: "whatsapp", icon: "💬", name: "WhatsApp" },
    { key: "twitter", icon: "𝕏", name: "Twitter" },
    { key: "facebook", icon: "📘", name: "Facebook" },
    { key: "telegram", icon: "✈️", name: "Telegram" },
    { key: "linkedin", icon: "💼", name: "LinkedIn" },
    { key: "instagram", icon: "📸", name: "Instagram" },
    { key: "email", icon: "📧", name: "Email" },
  ];

  return (
    <>
      <style>{FULL_CSS}</style>
      <div className="app">
        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">DESH<span>GYM</span></div>
          <div className="nav-tabs">
            <button className={`nav-tab ${tab === "home" ? "active" : ""}`} onClick={() => setTab("home")}>Home</button>
            <button className={`nav-tab ${tab === "browse" ? "active" : ""}`} onClick={() => setTab("browse")}>Browse</button>
            <button className={`nav-tab ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>{editingSite ? "✏️ Editing" : "Create Site"}</button>
            <button className={`nav-tab ${tab === "websites" ? "active" : ""}`} onClick={() => setTab("websites")}>
              My Sites {sites.length > 0 && <span className="nbadge">{sites.length}</span>}
            </button>
            {user && <button className={`nav-tab ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}>Dashboard</button>}
          </div>
          <button className="nav-cta" onClick={() => setTab("create")}>+ List Your Gym</button>
          {supabase && (
            user
              ? <><button className="nav-cta" style={{ background: subscription?.plan === "pro" || subscription?.plan === "agency" ? "var(--accent2)" : "none", border: "1px solid var(--border)", color: subscription?.plan === "pro" || subscription?.plan === "agency" ? "#fff" : "var(--muted)" }} onClick={() => setSubModal(true)}>{subscription?.plan === "pro" ? "⚡ Pro" : subscription?.plan === "agency" ? "🏢 Agency" : "⬆ Upgrade"}</button>
              <button className="nav-cta" style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)" }} onClick={() => signOut()?.then(() => setUser(null))}>👤 {user.email?.split("@")[0]} · Sign Out</button></>
              : <button className="nav-cta" style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)" }} onClick={() => setAuthModal(true)}>🔐 Sign In</button>
          )}
          <button className="hamburger" onClick={() => setMobileMenu(m => !m)}>
            <span /><span /><span />
          </button>
        </nav>
        <div className={`mob-menu ${mobileMenu ? "open" : ""}`}>
          {[["home","🏠 Home"],["browse","🔍 Browse"],["create", editingSite ? "✏️ Editing" : "⚡ Create Site"],["websites","🌐 My Sites"],["dashboard","📊 Dashboard"]].map(([t,l]) => (
            <button key={t} className={`mob-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setMobileMenu(false); }}>{l}</button>
          ))}
        </div>

        {/* ── LANDING PAGE ── */}
        {tab === "home" && (
          <div>
            {/* Hero */}
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 2rem", textAlign: "center", position: "relative", overflow: "hidden", background: "var(--bg)" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(232,255,0,.06) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ fontFamily: "var(--fc)", fontSize: ".75rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "20px" }}>🇮🇳 India's Gym Platform</div>
              <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(3.5rem,10vw,8rem)", letterSpacing: "3px", lineHeight: ".9", marginBottom: "28px", color: "var(--text)" }}>BUILD YOUR<br /><span style={{ color: "var(--accent)" }}>GYM WEBSITE</span><br />IN SECONDS</h1>
              <p style={{ fontSize: "1.1rem", color: "var(--muted)", maxWidth: "520px", lineHeight: "1.7", marginBottom: "40px" }}>DeshGym lets gym owners across India create stunning, fully-functional websites with AI — no coding, no designers, no waiting.</p>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
                <button style={{ padding: "16px 40px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "7px", fontFamily: "var(--fd)", fontSize: "1.3rem", letterSpacing: "2px", cursor: "pointer" }} onClick={() => setTab("create")}>⚡ BUILD FREE</button>
                <button style={{ padding: "16px 40px", background: "none", color: "var(--accent)", border: "1.5px solid var(--accent)", borderRadius: "7px", fontFamily: "var(--fd)", fontSize: "1.3rem", letterSpacing: "2px", cursor: "pointer" }} onClick={() => setTab("browse")}>🔍 BROWSE GYMS</button>
              </div>
              <div style={{ marginTop: "60px", display: "flex", gap: "40px", flexWrap: "wrap", justifyContent: "center" }}>
                {[["500+","Gyms Listed"],["10s","To Generate"],["100%","Free to Start"],["🇮🇳","Made for India"]].map(([n,l]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--fd)", fontSize: "2.2rem", letterSpacing: "2px", color: "var(--accent)" }}>{n}</div>
                    <div style={{ fontFamily: "var(--fc)", fontSize: ".7rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginTop: "4px" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div style={{ padding: "80px 2rem", background: "#0d0d0d" }}>
              <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <div style={{ fontFamily: "var(--fc)", fontSize: ".75rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "12px", textAlign: "center" }}>Why DeshGym</div>
                <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "2px", color: "var(--text)", marginBottom: "50px", textAlign: "center" }}>EVERYTHING YOUR GYM NEEDS</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" }}>
                  {[
                    ["⚡","AI Website Generator","Fill in your gym details and get a full professional website in under 30 seconds."],
                    ["📸","Photo Galleries","Upload trainer photos, equipment images, before/after transformations — all injected into your site."],
                    ["💰","Pricing Plans","Set monthly, quarterly and annual plans. Members can join directly from your website."],
                    ["⭐","Reviews & Ratings","Showcase real member reviews with star ratings on your gym website."],
                    ["📍","Google Maps","Your location is automatically embedded in the contact section."],
                    ["📊","Analytics","Track views and joins for every site you create."],
                    ["🔄","Version History","Every regeneration saves the old version — restore anytime."],
                    ["📤","Share Everywhere","Share on WhatsApp, Twitter, Instagram with one click. QR code included."],
                    ["🌐","Real URLs","Deploy to Vercel and get real `deshgym.in/sites/your-gym` URLs."],
                  ].map(([icon, title, desc]) => (
                    <div key={title} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{icon}</div>
                      <div style={{ fontFamily: "var(--fc)", fontSize: ".9rem", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>{title}</div>
                      <div style={{ fontSize: ".82rem", color: "var(--muted)", lineHeight: "1.6" }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div style={{ padding: "80px 2rem", background: "var(--bg)" }}>
              <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--fc)", fontSize: ".75rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "12px" }}>Pricing</div>
                <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "2px", color: "var(--text)", marginBottom: "50px" }}>START FREE, GROW ANYTIME</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "20px", textAlign: "left" }}>
                  {[
                    { name: "Free", price: "₹0", period: "forever", features: ["3 websites", "AI generation", "All sections", "Download HTML"], cta: "Get Started", popular: false },
                    { name: "Pro", price: "₹499", period: "/month", features: ["Unlimited websites", "Custom domain", "Priority support", "Remove branding", "Analytics dashboard"], cta: "Go Pro", popular: true },
                    { name: "Agency", price: "₹1999", period: "/month", features: ["Unlimited websites", "White label", "Client management", "API access", "Dedicated support"], cta: "Contact Us", popular: false },
                  ].map((plan, i) => (
                    <div key={plan.name} style={{ background: i === 1 ? "rgba(232,255,0,.05)" : "var(--card)", border: i === 1 ? "2px solid var(--accent)" : "1px solid var(--border)", borderRadius: "12px", padding: "28px", position: "relative" }}>
                      {plan.popular && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#000", fontFamily: "var(--fc)", fontSize: ".65rem", fontWeight: 700, letterSpacing: "1.5px", padding: "3px 14px", borderRadius: "20px" }}>POPULAR</div>}
                      <div style={{ fontFamily: "var(--fc)", fontSize: ".75rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: i === 1 ? "var(--accent)" : "var(--muted)", marginBottom: "12px" }}>{plan.name}</div>
                      <div style={{ fontFamily: "var(--fd)", fontSize: "2.8rem", letterSpacing: "1px", color: "var(--text)", lineHeight: 1 }}>{plan.price}</div>
                      <div style={{ fontSize: ".75rem", color: "var(--muted)", marginBottom: "24px" }}>{plan.period}</div>
                      {plan.features.map(f => <div key={f} style={{ fontSize: ".82rem", color: "#aaa", padding: "6px 0", borderBottom: "1px solid #1a1a1a", display: "flex", gap: "8px" }}><span style={{ color: "var(--accent)" }}>✓</span>{f}</div>)}
                      <button style={{ width: "100%", marginTop: "20px", padding: "12px", borderRadius: "7px", cursor: "pointer", fontFamily: "var(--fc)", fontSize: ".85rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", background: i === 1 ? "var(--accent)" : "transparent", color: i === 1 ? "#000" : "var(--accent)", border: i === 1 ? "none" : "1.5px solid var(--accent)" }} onClick={() => setTab("create")}>{plan.cta}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ padding: "80px 2rem", background: "#0d0d0d", textAlign: "center" }}>
              <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(2.5rem,6vw,5rem)", letterSpacing: "3px", color: "var(--text)", marginBottom: "20px" }}>READY TO BUILD?</h2>
              <p style={{ fontSize: "1rem", color: "var(--muted)", marginBottom: "36px" }}>Join hundreds of gym owners across India already using DeshGym.</p>
              <button style={{ padding: "18px 50px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "7px", fontFamily: "var(--fd)", fontSize: "1.4rem", letterSpacing: "2px", cursor: "pointer" }} onClick={() => { if (!user && supabase) setAuthModal(true); else setTab("create"); }}>
                {user ? "⚡ CREATE YOUR SITE" : "🔐 SIGN UP FREE"}
              </button>
            </div>
          </div>
        )}

        {/* ── BROWSE ── */}
        {tab === "browse" && <>
          <div className="hero">
            <div className="hero-label">🇮🇳 India's #1 Gym Discovery Platform</div>
            <h1 className="hero-title">FIND YOUR<br /><em>PERFECT</em><br />GYM</h1>
            <p className="hero-sub">Discover world-class fitness facilities across India — Mumbai, Delhi, Bengaluru and beyond.</p>
          </div>
          <div className="search-bar">
            <div className="swrap">
              <span className="sicon">🔍</span>
              <input className="sinput" placeholder="Search gyms, Mumbai, Delhi, Bengaluru..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {FILTERS.map(f => <button key={f} className={`fbtn ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}
            <div style={{ width: "100%", display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "4px" }}>
              {PRICE_FILTERS.map(([label, val]) => <button key={val} className={`fbtn ${priceFilter === val ? "on" : ""}`} onClick={() => setPriceFilter(val)}>💰 {label}</button>)}
            </div>
          </div>
          <div className="gym-grid">
            {fGyms.map(gym => {
              const g = effectiveGym(gym);
              return (
              <div key={g.id} className="gym-card" onClick={() => { setSelGym(g); setMtab("overview"); setEditDraft({ ...g }); }}>
                <div className="gym-img" style={{ background: g.gradient }}>
                  <span>{g.emoji}</span>
                  {g.badge && <div className={`gbadge ${g.isPremium ? "p" : ""}`}>{g.badge}</div>}
                  <div className="grating">⭐ {g.rating} ({g.reviews})</div>
                </div>
                <div className="gym-body">
                  <div className="gtype">{g.type}</div>
                  <div className="gname">{g.name}</div>
                  <div className="gloc">📍 {g.location}</div>
                  <div className="chips">{g.amenities.map(a => <span key={a} className="chip">{a}</span>)}</div>
                  <div className="gdesc">{g.desc}</div>
                  <div className="gfooter">
                    <div className="gprice">₹{g.price}<span>/mo</span></div>
                    <button className="gbtn" onClick={e => { e.stopPropagation(); setSelGym(g); setMtab("overview"); setEditDraft({ ...g }); }}>View Details</button>
                  </div>
                </div>
              </div>
              );
            })}

            {/* Generated sites shown as cards in browse */}
            {published.filter(s =>
              (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase())) &&
              (filter === "All" || s.type === filter)
            ).map(site => {
              const td = THEMES.find(t => t.id === site.theme) || THEMES[0];
              return (
                <div key={`site-${site.id}`} className="gym-card" onClick={() => openViewer(site)}>
                  <div className="wthumb" style={{ height: "190px" }}>
                    <iframe srcDoc={site.html} sandbox="allow-scripts" title={site.name} style={{ pointerEvents: "none" }} />
                    <div className="wthumb-ov">
                      <button className="wthumb-btn" onClick={e => { e.stopPropagation(); openViewer(site); }}>View Details</button>
                    </div>
                    <div className="gbadge" style={{ position: "absolute", top: 11, left: 11, background: td.accent, color: "#000" }}>MY SITE</div>
                    <div className="grating" style={{ position: "absolute", top: 11, right: 11 }}>⭐ NEW</div>
                  </div>
                  <div className="gym-body">
                    <div className="gtype">{site.type}</div>
                    <div className="gname">{site.name}</div>
                    <div className="gloc">📍 {site.location}</div>
                    <div className="gdesc" style={{ fontSize: ".75rem" }}>{site.tagline || "Generated gym website"}</div>
                    <div className="gfooter">
                      <div className="gprice">{site.price ? `₹${site.price}` : "—"}<span>/mo</span></div>
                      <button className="gbtn" onClick={e => { e.stopPropagation(); openViewer(site); }}>View Site</button>
                    </div>
                  </div>
                </div>
              );
            })}

            {fGyms.length === 0 && published.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "var(--muted)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
                <div style={{ fontFamily: "var(--fd)", fontSize: "1.6rem", letterSpacing: "2px" }}>NO RESULTS</div>
              </div>
            )}
          </div>
        </>}

        {/* ── CREATE ── */}
        {tab === "create" && (
          <div className="creator">
            <div className="cpanel">
              <div className="cptitle">BUILD YOUR GYM SITE</div>
              <div className="cpsub">Fill in details and generate a professional website instantly.</div>
              <div className="fsec">
                <div className="fstitle">Basic Info</div>
                <div className="frow"><label className="flbl">Gym Name *</label><input className="finput" placeholder="e.g. IRON DISTRICT" value={form.name} onChange={e => uf("name", e.target.value)} /></div>
                <div className="frow"><label className="flbl">Tagline</label><input className="finput" placeholder="Train Hard. Live Strong." value={form.tagline} onChange={e => uf("tagline", e.target.value)} /></div>
                <div className="frow"><label className="flbl">Gym Type</label><select className="fsel" value={form.type} onChange={e => uf("type", e.target.value)}>{GYM_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="frow"><label className="flbl">Location</label><input className="finput" placeholder="Bengaluru, Karnataka" value={form.location} onChange={e => uf("location", e.target.value)} /></div>
              </div>
              <div className="fsec">
                <div className="fstitle">Contact & Pricing</div>
                <div className="frow"><label className="flbl">Phone</label><input className="finput" placeholder="+91 98000 00000" value={form.phone} onChange={e => uf("phone", e.target.value)} /></div>
                <div className="frow"><label className="flbl">Email</label><input className="finput" placeholder="info@yourgym.com" value={form.email} onChange={e => uf("email", e.target.value)} /></div>
                <div className="frow"><label className="flbl">Monthly Price (₹)</label><input className="finput" type="number" placeholder="1999" value={form.price} onChange={e => uf("price", e.target.value)} /></div>
                <div className="frow"><label className="flbl">Opening Hours</label><input className="finput" placeholder="Mon-Fri 5am-11pm" value={form.hours} onChange={e => uf("hours", e.target.value)} /></div>
              </div>
              <div className="fsec">
                <div className="fstitle">Content</div>
                <div className="frow"><label className="flbl">Description</label><textarea className="ftxt" placeholder="Describe your gym..." value={form.description} onChange={e => uf("description", e.target.value)} /></div>
                <div className="frow"><label className="flbl">Key Highlights</label><textarea className="ftxt" style={{ minHeight: "65px" }} placeholder="Olympic platforms, certified coaches..." value={form.highlights} onChange={e => uf("highlights", e.target.value)} /></div>
              </div>
              <div className="fsec">
                <div className="fstitle">Amenities</div>
                <div className="atogls">{AMENITIES.map(a => <button key={a} className={`atogl ${selAmns.includes(a) ? "on" : ""}`} onClick={() => ta(a)}>{a}</button>)}</div>
              </div>
              <div className="fsec">
                <div className="fstitle">Color Theme</div>
                <div className="tswatches">{THEMES.map(t => <div key={t.id} className={`tswatch ${selTheme === t.id ? "sel" : ""}`} style={{ background: `linear-gradient(135deg,${t.bg} 50%,${t.accent} 100%)` }} onClick={() => setSelTheme(t.id)} title={t.label} />)}</div>
              </div>

              {/* ── TRAINERS ── */}
              <div className="fsec">
                <div className="fstitle">Trainers</div>
                {cTrainers.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "10px", marginBottom: "12px" }}>
                    {cTrainers.map(t => (
                      <div key={t.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                        <button className="delbtn" style={{ opacity: 1, position: "absolute", top: 5, right: 5, zIndex: 2, width: 22, height: 22 }} onClick={() => setCTrainers(p => p.filter(x => x.id !== t.id))}>✕</button>
                        {t.photo ? (
                          <div className="imgw" style={{ height: 100 }}>
                            <img src={t.photo} alt={t.name} style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
                            <div className="imgch">
                              <span className="imgchl">📷 Change</span>
                              <input type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                                onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setCTrainers(p => p.map(x => x.id === t.id ? { ...x, photo: ev.target?.result as string } : x)); r.readAsDataURL(f); }} />
                            </div>
                          </div>
                        ) : (
                          <div className="tph" style={{ height: 100 }}>
                            <span className="upi">👤</span>
                            <span className="upl">Upload Photo</span>
                            <input type="file" accept="image/*"
                              onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setCTrainers(p => p.map(x => x.id === t.id ? { ...x, photo: ev.target?.result as string } : x)); r.readAsDataURL(f); }} />
                          </div>
                        )}
                        <div style={{ padding: "9px" }}>
                          <div style={{ fontFamily: "var(--fc)", fontWeight: 700, fontSize: ".82rem", color: "var(--text)", lineHeight: 1.2 }}>{t.name}</div>
                          <div style={{ fontSize: ".68rem", color: "var(--accent)", fontFamily: "var(--fc)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginTop: 2 }}>{t.role}</div>
                          <div style={{ fontSize: ".65rem", color: "var(--muted)", marginTop: 4 }}>{t.speciality}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="addform">
                  <div className="addtitle">+ Add Trainer</div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "9px", alignItems: "flex-start" }}>
                    <label style={{ flexShrink: 0, width: 72, height: 72, borderRadius: "8px", overflow: "hidden", cursor: "pointer", position: "relative", background: "var(--card)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      {newCTr.photo
                        ? <img src={newCTr.photo} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <><span style={{ fontSize: "1.4rem" }}>👤</span><span style={{ fontFamily: "var(--fc)", fontSize: ".55rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--muted)", marginTop: 2 }}>Photo</span></>
                      }
                      <input type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                        onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setNewCTr(p => ({ ...p, photo: ev.target?.result as string })); r.readAsDataURL(f); }} />
                    </label>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "9px" }}>
                      <div className="addrow">
                        <input className="addinput" placeholder="Full Name *" value={newCTr.name} onChange={e => setNewCTr(p => ({ ...p, name: e.target.value }))} />
                        <input className="addinput" placeholder="Role (e.g. Head Coach)" value={newCTr.role} onChange={e => setNewCTr(p => ({ ...p, role: e.target.value }))} />
                      </div>
                      <div className="addrow">
                        <input className="addinput" placeholder="Speciality" value={newCTr.speciality} onChange={e => setNewCTr(p => ({ ...p, speciality: e.target.value }))} />
                        <input className="addinput" placeholder="Certification" value={newCTr.cert} onChange={e => setNewCTr(p => ({ ...p, cert: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div className="addrow">
                    <input className="addinput" placeholder="Experience (e.g. 5 yrs)" value={newCTr.exp} onChange={e => setNewCTr(p => ({ ...p, exp: e.target.value }))} />
                    <button className="addbtn" onClick={() => {
                      if (!newCTr.name.trim()) return;
                      setCTrainers(p => [...p, { id: Date.now(), name: newCTr.name, role: newCTr.role, speciality: newCTr.speciality, cert: newCTr.cert, exp: newCTr.exp, rating: 5.0, sessions: 0, photo: newCTr.photo }]);
                      setNewCTr({ name: "", role: "", speciality: "", cert: "", exp: "", photo: null });
                    }}>ADD</button>
                  </div>
                </div>
              </div>

              {/* ── EQUIPMENT ── */}
              <div className="fsec">
                <div className="fstitle">Equipment</div>
                {cEquipment.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "10px", marginBottom: "12px" }}>
                    {cEquipment.map(e => (
                      <div key={e.id} className="eq-card">
                        <button className="delbtn" style={{ opacity: 1, zIndex: 2 }} onClick={() => setCEquipment(p => p.filter(x => x.id !== e.id))}>✕</button>
                        {e.photo ? (
                          <div className="imgw">
                            <img src={e.photo} alt={e.name} className="eqimg" />
                            <div className="imgch">
                              <span className="imgchl">📷 Change</span>
                              <input type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                                onChange={ev => { const f = ev.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = re => setCEquipment(p => p.map(x => x.id === e.id ? { ...x, photo: re.target?.result as string } : x)); r.readAsDataURL(f); }} />
                            </div>
                          </div>
                        ) : (
                          <div className="eqph">
                            <span className="upi">📷</span>
                            <span className="upl">Upload Photo</span>
                            <input type="file" accept="image/*"
                              onChange={ev => { const f = ev.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = re => setCEquipment(p => p.map(x => x.id === e.id ? { ...x, photo: re.target?.result as string } : x)); r.readAsDataURL(f); }} />
                          </div>
                        )}
                        <div className="eqi">
                          <div className="eqnm">{e.name}</div>
                          <div className="eqqt">Qty: {e.qty}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="addform">
                  <div className="addtitle">+ Add Equipment</div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "9px", alignItems: "flex-start" }}>
                    <label style={{ flexShrink: 0, width: 72, height: 72, borderRadius: "8px", overflow: "hidden", cursor: "pointer", position: "relative", background: "var(--card)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      {newCEq.photo
                        ? <img src={newCEq.photo} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <><span style={{ fontSize: "1.4rem" }}>📷</span><span style={{ fontFamily: "var(--fc)", fontSize: ".55rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--muted)", marginTop: 2 }}>Photo</span></>
                      }
                      <input type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                        onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setNewCEq(p => ({ ...p, photo: ev.target?.result as string })); r.readAsDataURL(f); }} />
                    </label>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "9px" }}>
                      <input className="addinput" placeholder="Equipment Name *" value={newCEq.name} onChange={e => setNewCEq(p => ({ ...p, name: e.target.value }))} />
                      <input className="addinput" placeholder="Category" value={newCEq.category} onChange={e => setNewCEq(p => ({ ...p, category: e.target.value }))} />
                    </div>
                  </div>
                  <div className="addrow">
                    <input className="addinput" type="number" placeholder="Qty" value={newCEq.qty} onChange={e => setNewCEq(p => ({ ...p, qty: e.target.value }))} />
                    <button className="addbtn" onClick={() => {
                      if (!newCEq.name.trim()) return;
                      setCEquipment(p => [...p, { id: Date.now(), name: newCEq.name, category: newCEq.category || "General", qty: Number(newCEq.qty) || 1, photo: newCEq.photo }]);
                      setNewCEq({ name: "", category: "", qty: "1", photo: null });
                    }}>ADD</button>
                  </div>
                </div>
              </div>

              {/* ── PRICING PLANS ── */}
              <div className="fsec">
                <div className="fstitle">Pricing Plans</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {cPlans.map((plan, i) => (
                    <div key={plan.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px" }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                        <input className="addinput" style={{ flex: 1 }} placeholder="Plan name" value={plan.name} onChange={e => setCPlans(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                        <span style={{ color: "var(--muted)", fontSize: ".8rem" }}>₹</span>
                        <input className="addinput" style={{ width: "90px" }} type="number" placeholder="Price" value={plan.price} onChange={e => setCPlans(p => p.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} />
                      </div>
                      <textarea className="addinput" style={{ resize: "vertical", minHeight: "52px", width: "100%" }} placeholder="Features (comma separated)" value={plan.features} onChange={e => setCPlans(p => p.map((x, j) => j === i ? { ...x, features: e.target.value } : x))} />
                    </div>
                  ))}
                  <button className="addbtn" style={{ background: "none", border: "1px dashed var(--border)", color: "var(--muted)" }}
                    onClick={() => setCPlans(p => [...p, { id: Date.now(), name: "Custom Plan", price: "", features: "" }])}>
                    + Add Plan
                  </button>
                </div>
              </div>

              {/* ── GALLERY ── */}
              <div className="fsec">
                <div className="fstitle">Gallery</div>
                {cGallery.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: "8px", marginBottom: "12px" }}>
                    {cGallery.map(g => (
                      <div key={g.id} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", aspectRatio: "4/3" }}>
                        <img src={g.photo} alt={g.caption} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <button className="delbtn" style={{ opacity: 1, position: "absolute", top: 4, right: 4 }} onClick={() => setCGallery(p => p.filter(x => x.id !== g.id))}>✕</button>
                        <input style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,.7)", border: "none", color: "#fff", fontSize: ".65rem", padding: "4px 7px", outline: "none", fontFamily: "var(--fb)" }}
                          placeholder="Caption..." value={g.caption} onChange={e => setCGallery(p => p.map(x => x.id === g.id ? { ...x, caption: e.target.value } : x))} />
                      </div>
                    ))}
                  </div>
                )}
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", background: "var(--card)", border: "1px dashed var(--border)", borderRadius: "8px", cursor: "pointer", fontFamily: "var(--fc)", fontSize: ".75rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--muted)" }}>
                  📷 Add Photos
                  <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => {
                    Array.from(e.target.files || []).forEach(f => {
                      const r = new FileReader();
                      r.onload = ev => setCGallery(p => [...p, { id: Date.now() + Math.random(), photo: ev.target?.result as string, caption: "" }]);
                      r.readAsDataURL(f);
                    });
                    e.target.value = "";
                  }} />
                </label>
              </div>

              {/* ── BEFORE/AFTER ── */}
              <div className="fsec">
                <div className="fstitle">Transformations (Before/After)</div>
                {cBeforeAfter.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
                    {cBeforeAfter.map(t => (
                      <div key={t.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", position: "relative" }}>
                        <button className="delbtn" style={{ opacity: 1, position: "absolute", top: 8, right: 8, width: 20, height: 20 }} onClick={() => setCBeforeAfter(p => p.filter(x => x.id !== t.id))}>✕</button>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "6px" }}>
                          <img src={t.before} alt="before" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: "5px", filter: "grayscale(40%)" }} />
                          <img src={t.after} alt="after" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: "5px" }} />
                        </div>
                        <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{t.label || "Transformation"}</div>
                      </div>
                    ))}
                  </div>
                )}
                <BAForm onAdd={item => setCBeforeAfter(p => [...p, item])} />
              </div>

              {/* ── REVIEWS ── */}
              <div className="fsec">
                <div className="fstitle">Reviews</div>
                {cReviews.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {cReviews.map(r => (
                      <div key={r.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", position: "relative" }}>
                        <button className="delbtn" style={{ opacity: 1, position: "absolute", top: 8, right: 8, width: 20, height: 20 }} onClick={() => setCReviews(p => p.filter(x => x.id !== r.id))}>✕</button>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontFamily: "var(--fc)", fontWeight: 700, fontSize: ".82rem", color: "var(--text)" }}>{r.name}</span>
                          <span style={{ color: "#f5c518", fontSize: ".8rem" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        </div>
                        <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{r.comment}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="addform">
                  <div className="addtitle">+ Add Review</div>
                  <div className="addrow">
                    <input className="addinput" placeholder="Reviewer Name *" value={newCReview.name} onChange={e => setNewCReview(p => ({ ...p, name: e.target.value }))} />
                    <select className="addinput" value={newCReview.rating} onChange={e => setNewCReview(p => ({ ...p, rating: Number(e.target.value) }))}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{"★".repeat(n)} {n} Star{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: "9px" }}>
                    <textarea className="addinput" style={{ resize: "vertical", minHeight: "60px", width: "100%" }} placeholder="Review comment..." value={newCReview.comment} onChange={e => setNewCReview(p => ({ ...p, comment: e.target.value }))} />
                  </div>
                  <div className="addrow">
                    <input className="addinput" type="date" value={newCReview.date} onChange={e => setNewCReview(p => ({ ...p, date: e.target.value }))} />
                    <button className="addbtn" onClick={() => {
                      if (!newCReview.name.trim() || !newCReview.comment.trim()) return;
                      setCReviews(p => [...p, { id: Date.now(), ...newCReview }]);
                      setNewCReview({ name: "", rating: 5, comment: "", date: "" });
                    }}>ADD</button>
                  </div>
                </div>
              </div>

              {/* ── PROMO BANNER ── */}
              <div className="fsec">
                <div className="fstitle">Promo Banner</div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontFamily: "var(--fc)", fontSize: ".75rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: cPromo.enabled ? "var(--accent)" : "var(--muted)", cursor: "pointer" }}>
                  <input type="checkbox" checked={cPromo.enabled} onChange={e => setCPromo(p => ({ ...p, enabled: e.target.checked }))} style={{ accentColor: "var(--accent)" }} />
                  {cPromo.enabled ? "Enabled" : "Disabled"}
                </label>
                {cPromo.enabled && <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input className="addinput" placeholder="Banner text" value={cPromo.text} onChange={e => setCPromo(p => ({ ...p, text: e.target.value }))} />
                  <div className="addrow">
                    <input className="addinput" placeholder="CTA button text" value={cPromo.cta} onChange={e => setCPromo(p => ({ ...p, cta: e.target.value }))} />
                    <input className="addinput" placeholder="Custom color (e.g. #ff4d1c)" value={cPromo.accent} onChange={e => setCPromo(p => ({ ...p, accent: e.target.value }))} />
                  </div>
                </div>}
              </div>

              {/* ── TRIAL CLASS ── */}
              <div className="fsec">
                <div className="fstitle">Free Trial Booking</div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontFamily: "var(--fc)", fontSize: ".75rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: cTrial.enabled ? "var(--accent)" : "var(--muted)", cursor: "pointer" }}>
                  <input type="checkbox" checked={cTrial.enabled} onChange={e => setCTrial(p => ({ ...p, enabled: e.target.checked }))} style={{ accentColor: "var(--accent)" }} />
                  {cTrial.enabled ? "Enabled" : "Disabled"}
                </label>
                {cTrial.enabled && <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input className="addinput" placeholder="Section title" value={cTrial.title} onChange={e => setCTrial(p => ({ ...p, title: e.target.value }))} />
                  <input className="addinput" placeholder="Subtitle" value={cTrial.subtitle} onChange={e => setCTrial(p => ({ ...p, subtitle: e.target.value }))} />
                </div>}
              </div>

              {/* ── FAQ ── */}
              <div className="fsec">
                <div className="fstitle">FAQ</div>
                {cFaq.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {cFaq.map(f => (
                      <div key={f.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", position: "relative" }}>
                        <button className="delbtn" style={{ opacity: 1, position: "absolute", top: 8, right: 8, width: 20, height: 20 }} onClick={() => setCFaq(p => p.filter(x => x.id !== f.id))}>✕</button>
                        <div style={{ fontFamily: "var(--fc)", fontWeight: 700, fontSize: ".82rem", color: "var(--text)", marginBottom: "3px", paddingRight: "24px" }}>{f.q}</div>
                        <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{f.a}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="addform">
                  <div className="addtitle">+ Add FAQ</div>
                  <input className="addinput" style={{ width: "100%", marginBottom: "9px" }} placeholder="Question *" value={newFaq.q} onChange={e => setNewFaq(p => ({ ...p, q: e.target.value }))} />
                  <textarea className="addinput" style={{ resize: "vertical", minHeight: "60px", width: "100%", marginBottom: "9px" }} placeholder="Answer *" value={newFaq.a} onChange={e => setNewFaq(p => ({ ...p, a: e.target.value }))} />
                  <button className="addbtn" onClick={() => {
                    if (!newFaq.q.trim() || !newFaq.a.trim()) return;
                    setCFaq(p => [...p, { id: Date.now(), ...newFaq }]);
                    setNewFaq({ q: "", a: "" });
                  }}>ADD</button>
                </div>
              </div>

              <button className="genbtn" onClick={generate} disabled={!form.name || generating}>{generating ? "⏳ GENERATING..." : editingSite ? "🔄 REGENERATE WEBSITE" : "⚡ GENERATE WEBSITE"}</button>
              {editingSite && <button style={{ width: "100%", marginTop: "8px", padding: "10px", fontFamily: "var(--fc)", fontSize: ".75rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", background: "none", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: "7px", cursor: "pointer" }} onClick={() => { setEditingSite(null); setPrevHtml(""); }}>✕ Cancel Edit</button>}
            </div>
            <div className="cprev">
              {editingSite && <div style={{ background: "rgba(232,255,0,.08)", border: "1px solid rgba(232,255,0,.2)", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontFamily: "var(--fc)", fontSize: ".72rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--accent)" }}>✏️ Editing: {editingSite.name}</div>}
              <div className="prvhdr">
                <span className="prvlbl">Live Preview</span>
                <div className="prvacts">
                  <button className={`prvact ${previewTheme === "dark" ? "pub" : ""}`} onClick={() => setPreviewTheme("dark")}>🌑 Dark</button>
                  <button className={`prvact ${previewTheme === "light" ? "pub" : ""}`} onClick={() => setPreviewTheme("light")}>☀️ Light</button>
                  {prevHtml && <>
                    <button className="prvact" onClick={() => { const s = sites.find(x => x.name === form.name); if (s) openViewer(s); }}>🌐 View Site</button>
                    <button className="prvact" onClick={() => { const s = sites.find(x => x.name === form.name); if (s) { setSharing(s); setCopied(false); } }}>📤 Share</button>
                    <button className="prvact" onClick={() => { const s = sites.find(x => x.name === form.name); if (s) dlSite(s); }}>⬇ Download</button>
                    <button className="prvact pub" onClick={() => setTab("websites")}>📁 My Sites</button>
                  </>}
                </div>
              </div>
              <div className="bwrap">
                <div className="bbar">
                  <div className="bdot" style={{ background: "#ff5f57" }} /><div className="bdot" style={{ background: "#febc2e" }} /><div className="bdot" style={{ background: "#28c840" }} />
                  <div className="burl">{form.name ? siteUrl(form.name) : "https://deshgym.in/sites/your-gym"}</div>
                </div>
                <div className="pbody">
                  {generating && <div className="ldstate"><div className="spinner" /><div className="spintxt">Building your website...</div></div>}
                  {!generating && prevHtml && <iframe srcDoc={prevHtml} style={{ width: "100%", minHeight: "560px", border: "none", display: "block", filter: previewTheme === "light" ? "invert(1) hue-rotate(180deg)" : "none" }} title="preview" sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-forms" />}
                  {!generating && !prevHtml && <div className="emstate"><div className="emico">⚡</div><div className="emtitle">READY TO BUILD</div><div className="emsub">Fill in your gym details and click Generate Website.</div></div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MY SITES ── */}
        {tab === "websites" && (
          <div className="wpage">
            <div className="wphdr">
              <h1 className="wptitle">MY <em>WEBSITES</em></h1>
              <p className="wpsub">{sites.length} website{sites.length !== 1 ? "s" : ""} — view live, share or download anytime.</p>
            </div>
            {sites.length > 0 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
                <div className="swrap" style={{ flex: 1, minWidth: "200px" }}>
                  <span className="sicon">🔍</span>
                  <input className="sinput" placeholder="Search your sites..." value={sitesSearch} onChange={e => setSitesSearch(e.target.value)} />
                </div>
                <select className="fsel" style={{ width: "auto", padding: "11px 13px" }} value={sitesFilter} onChange={e => setSitesFilter(e.target.value)}>
                  <option value="All">All Types</option>
                  {["Powerlifting","CrossFit & Functional","Yoga & Pilates","Bodybuilding","MMA & Boxing","Boutique Fitness","General Fitness"].map(t => <option key={t}>{t}</option>)}
                </select>
                <select className="fsel" style={{ width: "auto", padding: "11px 13px" }} value={sitesPriceFilter} onChange={e => setSitesPriceFilter(e.target.value)}>
                  <option value="All">All Prices</option>
                  <option value="<2000">Under ₹2000</option>
                  <option value="2000-4000">₹2000–₹4000</option>
                  <option value=">4000">Above ₹4000</option>
                </select>
                <button className="fbtn" style={{ whiteSpace: "nowrap" }} onClick={() => exportZip(fSites)}>📦 Export All ({fSites.length})</button>
              </div>
            )}
            {sites.length === 0 ? (
              <div className="wempty">
                <div className="wemico">🌐</div>
                <div className="wetitle">NO WEBSITES YET</div>
                <p className="wesub">Go to Create Site, fill in your gym details and generate your first site.</p>
                <button className="wecta" onClick={() => setTab("create")}>⚡ CREATE YOUR FIRST WEBSITE</button>
              </div>
            ) : fSites.length === 0 ? (
              <div className="wempty">
                <div className="wemico">🔍</div>
                <div className="wetitle">NO RESULTS</div>
                <p className="wesub">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="wgrid">
                {fSites.map(site => {
                  const td = THEMES.find(t => t.id === site.theme) || THEMES[0];
                  return (
                    <div key={site.id} className="wcard">
                      <div className="wthumb" onClick={() => openViewer(site)}>
                        <iframe srcDoc={site.html} sandbox="allow-scripts" title={site.name} />
                        <div className="wthumb-ov"><button className="wthumb-btn">🌐 Open Site</button></div>
                      </div>
                      <div className="wcbody">
                        <div className="wcnm">{site.name}</div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <span className="stat-pill">� {siteAnalytics[site.id]?.views || 0} views</span>
                          <span className="stat-pill">✅ {siteAnalytics[site.id]?.joins || 0} joins</span>
                        </div>
                        <div className="wcmeta">
                          <span>🏷 {site.type}</span><span>📍 {site.location}</span>
                          {site.price && <span>₹{site.price}/mo</span>}
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: td.accent, display: "inline-block" }} />{td.label}</span>
                          <span>🕐 {site.createdAt}</span>
                        </div>
                        <div className="wcurl">{site.url}</div>
                        <div style={{ display: "flex", gap: "6px", marginBottom: "8px", alignItems: "center" }}>
                          <input className="sinput" style={{ flex: 1, padding: "6px 10px", fontSize: ".72rem" }}
                            placeholder="subdomain (e.g. irondistrict)"
                            defaultValue={(site as Site & { subdomain?: string }).subdomain || ""}
                            onBlur={async e => {
                              const val = e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
                              if (val && user) { await setSubdomain(site.id, val); }
                            }} />
                          <span style={{ fontSize: ".7rem", color: "var(--muted)", whiteSpace: "nowrap" }}>.deshgym.in</span>
                        </div>
                        <div className="wcacts">
                          <button className="wbtn p" onClick={() => openViewer(site)}>🌐 View</button>
                          <button className="wbtn" onClick={() => { setSharing(site); setCopied(false); }}>📤 Share</button>
                          <button className="wbtn" onClick={() => editSite(site)} title="Edit & Regenerate">✏️</button>
                          <button className="wbtn" onClick={() => dupSite(site)} title="Duplicate">⧉</button>
                          <button className="wbtn" onClick={() => dlSite(site)}>⬇</button>
                          <button
                            className="wbtn"
                            style={published.find(s => s.id === site.id) ? { borderColor: "#22c55e", color: "#22c55e" } : {}}
                            onClick={() => { publishToBrowse(site); if (user) publishSite(site.id, true); }}
                          >
                            {published.find(s => s.id === site.id) ? "✓ Listed" : "📌 List"}
                          </button>
                          <button className="wbtn d" onClick={() => { setSites(p => p.filter(s => s.id !== site.id)); if (user) deleteSite(site.id); }}>🗑</button>
                        </div>
                        {site.versions && site.versions.length > 0 && (
                          <div style={{ marginTop: "10px", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                            <div style={{ fontFamily: "var(--fc)", fontSize: ".62rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "7px" }}>🕐 Version History ({site.versions.length})</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                              {site.versions.map((v, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", borderRadius: "5px", padding: "6px 10px" }}>
                                  <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>v{site.versions!.length - i} · {v.createdAt}</span>
                                  <button style={{ fontFamily: "var(--fc)", fontSize: ".65rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", background: "none", border: "1px solid var(--border)", color: "var(--muted)" }}
                                    onClick={() => { setVersionSite(site); setViewingVersion(v); }}>View</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div style={{ gridColumn: "1/-1" }}>
                  <button style={{ width: "100%", padding: "14px", fontFamily: "var(--fc)", fontSize: ".8rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", background: "none", border: "1px dashed var(--border)", color: "var(--muted)", borderRadius: "8px", cursor: "pointer" }} onClick={() => setTab("create")}>+ Create Another Website</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && user && (
          <div className="wpage">
            <div className="wphdr">
              <h1 className="wptitle">GYM OWNER <em>DASHBOARD</em></h1>
              <p className="wpsub">Welcome back, {user.email?.split("@")[0]}. Here's your overview.</p>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "14px", marginBottom: "32px" }}>
              {[
                ["🌐", sites.length, "Total Sites"],
                ["👁", Object.values(siteAnalytics).reduce((s, a) => s + a.views, 0), "Total Views"],
                ["✅", Object.values(siteAnalytics).reduce((s, a) => s + a.joins, 0), "Total Joins"],
                ["📌", published.length, "Published"],
              ].map(([icon, val, lbl]) => (
                <div key={String(lbl)} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>{icon}</div>
                  <div style={{ fontFamily: "var(--fd)", fontSize: "2.2rem", letterSpacing: "2px", color: "var(--accent)" }}>{val}</div>
                  <div style={{ fontFamily: "var(--fc)", fontSize: ".68rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginTop: "4px" }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontFamily: "var(--fc)", fontSize: ".68rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "14px" }}>Quick Actions</div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[["⚡ New Site","create"],["🔍 Browse","browse"],["🌐 My Sites","websites"]].map(([l,t]) => (
                  <button key={t} style={{ padding: "11px 22px", fontFamily: "var(--fc)", fontSize: ".78rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: "7px", cursor: "pointer" }} onClick={() => setTab(t)}>{l}</button>
                ))}
                <button style={{ padding: "11px 22px", fontFamily: "var(--fc)", fontSize: ".78rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: "7px", cursor: "pointer" }} onClick={() => exportZip(sites)}>📦 Export All Sites</button>
              </div>
            </div>

            {/* Sites table */}
            {sites.length > 0 && (
              <div>
                <div style={{ fontFamily: "var(--fc)", fontSize: ".68rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "14px" }}>All Sites</div>
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Site","Type","Location","Price","Views","Joins","Status","Actions"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--fc)", fontSize: ".65rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sites.map(site => (
                        <tr key={site.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px 16px", fontFamily: "var(--fc)", fontWeight: 700, fontSize: ".85rem", color: "var(--text)" }}>{site.name}</td>
                          <td style={{ padding: "12px 16px", fontSize: ".78rem", color: "var(--muted)" }}>{site.type}</td>
                          <td style={{ padding: "12px 16px", fontSize: ".78rem", color: "var(--muted)" }}>{site.location}</td>
                          <td style={{ padding: "12px 16px", fontSize: ".78rem", color: "var(--muted)" }}>{site.price ? `₹${site.price}` : "—"}</td>
                          <td style={{ padding: "12px 16px", fontSize: ".78rem", color: "var(--accent)" }}>{siteAnalytics[site.id]?.views || 0}</td>
                          <td style={{ padding: "12px 16px", fontSize: ".78rem", color: "#22c55e" }}>{siteAnalytics[site.id]?.joins || 0}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontFamily: "var(--fc)", fontSize: ".65rem", fontWeight: 700, letterSpacing: "1px", padding: "3px 9px", borderRadius: "20px", background: published.find(s => s.id === site.id) ? "rgba(34,197,94,.12)" : "rgba(255,255,255,.04)", color: published.find(s => s.id === site.id) ? "#22c55e" : "var(--muted)", border: `1px solid ${published.find(s => s.id === site.id) ? "#22c55e" : "var(--border)"}` }}>
                              {published.find(s => s.id === site.id) ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button style={{ fontFamily: "var(--fc)", fontSize: ".65rem", fontWeight: 700, letterSpacing: "1px", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", background: "var(--accent)", color: "#000", border: "none" }} onClick={() => openViewer(site)}>View</button>
                              <button style={{ fontFamily: "var(--fc)", fontSize: ".65rem", fontWeight: 700, letterSpacing: "1px", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", background: "none", border: "1px solid var(--border)", color: "var(--muted)" }} onClick={() => editSite(site)}>Edit</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GYM MODAL ── */}
        {selGym && (
          <div className="overlay" onClick={() => setSelGym(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="mhero" style={{ background: selGym.gradient }}>
                <span>{selGym.emoji}</span>
                {selGym.badge && <div className={`gbadge ${selGym.isPremium ? "p" : ""}`} style={{ position: "absolute", top: 12, left: 12 }}>{selGym.badge}</div>}
                <button className="mclose" onClick={() => setSelGym(null)}>✕</button>
              </div>
              <div className="mbody">
                <div className="mtype">{selGym.type}</div>
                <div className="mname">{selGym.name}</div>
                <div className="mmeta">
                  <div className="mmeta-i">📍 <strong>{selGym.location}</strong></div>
                  <div className="mmeta-i">🕐 <strong>Mon–Sun 5am–11pm</strong></div>
                  <div className="mmeta-i">📞 <strong>+91 98000 00000</strong></div>
                </div>
                <div className="mrating">
                  <div className="stars">{"★".repeat(Math.floor(selGym.rating))}</div>
                  <div className="rnum">{selGym.rating}</div>
                  <div className="rcnt">({selGym.reviews} reviews)</div>
                </div>
                <div className="mtabs">
                  {["overview", "equipment", "trainers", "pricing", "edit"].map(t => (
                    <button key={t} className={`mtab ${mtab === t ? "active" : ""}`} onClick={() => setMtab(t)}>
                      {t === "overview" ? "📋 Overview" : t === "equipment" ? "🏋️ Equipment" : t === "trainers" ? "👤 Trainers" : t === "pricing" ? "🎟 Pricing" : "✏️ Edit"}
                    </button>
                  ))}
                </div>

                {mtab === "overview" && <>
                  <div className="stitle">About</div>
                  <div className="mdesc">{selGym.desc}</div>
                  <div className="stitle">Amenities</div>
                  <div className="mamnts">{selGym.amenities.map(a => <span key={a} className="mamnt">✓ {a}</span>)}</div>
                  <hr className="mdiv" />
                  <div className="pbox">
                    <div>
                      <div className="plbl">Monthly Membership</div>
                      <div className="pval">₹{selGym.price}</div>
                      <div className="psub">No joining fee · Cancel anytime</div>
                    </div>
                    <div className="macts">
                      <button className="msbtn" onClick={() => setSelGym(null)}>← Back</button>
                      <button className="mpbtn" onClick={openJoin}>JOIN NOW</button>
                    </div>
                  </div>
                </>}

                {mtab === "equipment" && (() => {
                  const eq = getEq(selGym.id, selGym.type);
                  const cats = [...new Set(eq.map(e => e.category))];
                  return <>
                    <div className="sbar">
                      <div className="stn"><div className="stn-n">{eq.length}</div><div className="stn-l">Types</div></div>
                      <div className="stn"><div className="stn-n">{eq.reduce((s, e) => s + e.qty, 0)}</div><div className="stn-l">Units</div></div>
                      <div className="stn"><div className="stn-n">{cats.length}</div><div className="stn-l">Categories</div></div>
                      <div className="stn"><div className="stn-n">{eq.filter(e => e.photo).length}</div><div className="stn-l">With Photos</div></div>
                    </div>
                    {cats.map(cat => (
                      <div key={cat}>
                        <div className="cat-title">{cat}</div>
                        <div className="eq-grid">
                          {eq.filter(e => e.category === cat).map(e => (
                            <div key={e.id} className="eq-card">
                              <button className="delbtn" onClick={() => delEq(selGym.id, selGym.type, e.id)}>✕</button>
                              {e.photo
                                ? <div className="imgw"><img src={e.photo} className="eqimg" alt={e.name} /><div className="imgch"><input type="file" accept="image/*" onChange={ev => uplEq(selGym.id, selGym.type, e.id, ev.target.files?.[0] ?? null)} /><span className="imgchl">📷 Change</span></div></div>
                                : <div className="eqph"><input type="file" accept="image/*" onChange={ev => uplEq(selGym.id, selGym.type, e.id, ev.target.files?.[0] ?? null)} /><div className="upi">📷</div><div className="upl">Upload Photo</div></div>
                              }
                              <div className="eqi"><div className="eqnm">{e.name}</div><div className="eqqt">Qty: {e.qty}</div></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="addform">
                      <div className="addtitle">+ Add Equipment</div>
                      <div className="addrow">
                        <input className="addinput" placeholder="Name" value={newEq.name} onChange={e => setNewEq(p => ({ ...p, name: e.target.value }))} />
                        <input className="addinput" placeholder="Category" value={newEq.category} onChange={e => setNewEq(p => ({ ...p, category: e.target.value }))} />
                      </div>
                      <div className="addrow">
                        <input className="addinput" type="number" placeholder="Qty" value={newEq.qty} onChange={e => setNewEq(p => ({ ...p, qty: Number(e.target.value) }))} />
                        <button className="addbtn" onClick={() => addEq(selGym.id, selGym.type)}>ADD</button>
                      </div>
                    </div>
                  </>;
                })()}

                {mtab === "trainers" && (() => {
                  const tr = getTr(selGym.id, selGym.type);
                  return <>
                    <div className="sbar">
                      <div className="stn"><div className="stn-n">{tr.length}</div><div className="stn-l">Trainers</div></div>
                      <div className="stn"><div className="stn-n">{(tr.reduce((s, t) => s + t.rating, 0) / tr.length).toFixed(1)}</div><div className="stn-l">Avg Rating</div></div>
                      <div className="stn"><div className="stn-n">{tr.reduce((s, t) => s + t.sessions, 0).toLocaleString()}</div><div className="stn-l">Sessions</div></div>
                    </div>
                    <div className="tgrid">
                      {tr.map(t => (
                        <div key={t.id} className="tcard">
                          <button className="delbtn" onClick={() => delTr(selGym.id, selGym.type, t.id)}>✕</button>
                          {t.photo
                            ? <div className="imgw"><img src={t.photo} className="tavtr" alt={t.name} /><div className="imgch"><input type="file" accept="image/*" onChange={ev => uplTr(selGym.id, selGym.type, t.id, ev.target.files?.[0] ?? null)} /><span className="imgchl">📷</span></div></div>
                            : <div className="tph"><input type="file" accept="image/*" onChange={ev => uplTr(selGym.id, selGym.type, t.id, ev.target.files?.[0] ?? null)} /><div className="temoji">👤</div><div className="upl">Upload Photo</div></div>
                          }
                          <div className="tinfo">
                            <div className="tnm">{t.name}</div>
                            <div className="trl">{t.role}</div>
                            <div className="ttags">
                              {t.speciality && <span className="ttag">🎯 {t.speciality}</span>}
                              {t.cert && <span className="ttag">🏅 {t.cert}</span>}
                              {t.exp && <span className="ttag">⏱ {t.exp}</span>}
                            </div>
                            <div className="tstats">
                              <span className="tstat">⭐ {t.rating}</span>
                              {t.sessions > 0 && <span className="tstat">{t.sessions.toLocaleString()}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="addform">
                      <div className="addtitle">+ Add Trainer</div>
                      <div className="addrow">
                        <input className="addinput" placeholder="Full Name *" value={newTr.name} onChange={e => setNewTr(p => ({ ...p, name: e.target.value }))} />
                        <input className="addinput" placeholder="Role" value={newTr.role} onChange={e => setNewTr(p => ({ ...p, role: e.target.value }))} />
                      </div>
                      <div className="addrow">
                        <input className="addinput" placeholder="Speciality" value={newTr.speciality} onChange={e => setNewTr(p => ({ ...p, speciality: e.target.value }))} />
                        <input className="addinput" placeholder="Certification" value={newTr.cert} onChange={e => setNewTr(p => ({ ...p, cert: e.target.value }))} />
                      </div>
                      <div className="addrow">
                        <input className="addinput" placeholder="Experience" value={newTr.exp} onChange={e => setNewTr(p => ({ ...p, exp: e.target.value }))} />
                        <button className="addbtn" onClick={() => addTr(selGym.id, selGym.type)}>ADD</button>
                      </div>
                    </div>
                  </>;
                })()}

                {mtab === "pricing" && (() => {
                  const plans = [
                    { id: "monthly",   label: "Monthly",   price: selGym.price,                        save: null,       popular: false },
                    { id: "quarterly", label: "Quarterly", price: Math.round(selGym.price * 2.7),      save: "Save 10%", popular: true  },
                    { id: "annual",    label: "Annual",    price: Math.round(selGym.price * 10),       save: "Save 17%", popular: false },
                  ];
                  const features = {
                    monthly:   ["Full gym access", "Locker room", "Free WiFi"],
                    quarterly: ["Full gym access", "Locker room", "Free WiFi", "1 PT session/month", "Diet consultation"],
                    annual:    ["Full gym access", "Locker room", "Free WiFi", "4 PT sessions/month", "Diet plan", "Guest passes ×2"],
                  };
                  return (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "22px" }}>
                        {plans.map(p => (
                          <div key={p.id} style={{
                            background: p.popular ? "rgba(232,255,0,.06)" : "var(--surface)",
                            border: `1.5px solid ${p.popular ? "var(--accent)" : "var(--border)"}`,
                            borderRadius: "10px", padding: "16px 12px", textAlign: "center", position: "relative"
                          }}>
                            {p.popular && <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#000", fontFamily: "var(--fc)", fontSize: ".6rem", fontWeight: 700, letterSpacing: "1px", padding: "2px 10px", borderRadius: "20px" }}>POPULAR</div>}
                            <div style={{ fontFamily: "var(--fc)", fontSize: ".68rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: p.popular ? "var(--accent)" : "var(--muted)", marginBottom: "8px" }}>{p.label}</div>
                            <div style={{ fontFamily: "var(--fd)", fontSize: "1.8rem", letterSpacing: "1px", color: "var(--text)", lineHeight: 1 }}>₹{p.price}</div>
                            <div style={{ fontSize: ".68rem", color: "var(--muted)", marginBottom: "12px" }}>/{p.label.toLowerCase()}</div>
                            {p.save && <div style={{ fontSize: ".65rem", color: "var(--accent2)", fontWeight: 700, fontFamily: "var(--fc)", marginBottom: "10px" }}>{p.save}</div>}
                            <div style={{ textAlign: "left", marginBottom: "14px" }}>
                              {features[p.id as keyof typeof features].map(f => (
                                <div key={f} style={{ fontSize: ".72rem", color: "var(--muted)", padding: "3px 0", display: "flex", gap: "6px", alignItems: "center" }}>
                                  <span style={{ color: "var(--accent)", fontSize: ".7rem" }}>✓</span>{f}
                                </div>
                              ))}
                            </div>
                            <button className="gbtn" style={{ width: "100%", padding: "9px", fontSize: ".68rem" }}
                              onClick={() => { openJoin(); setJForm(f => ({ ...f, plan: p.id })); }}>
                              SELECT
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="pbox">
                        <div>
                          <div className="plbl">Ready to join?</div>
                          <div style={{ fontSize: ".83rem", color: "var(--muted)" }}>No joining fee · Cancel anytime · WhatsApp confirmation</div>
                        </div>
                        <button className="mpbtn" style={{ padding: "12px 24px" }} onClick={openJoin}>JOIN NOW</button>
                      </div>
                    </div>
                  );
                })()}

                {mtab === "edit" && (() => {
                  const ed = editDraft;
                  const upd = (k: keyof Gym, v: unknown) => setEditDraft(p => ({ ...p, [k]: v }));
                  const save = () => {
                    setGymOverrides(p => ({ ...p, [selGym.id]: { ...p[selGym.id], ...editDraft } }));
                    setSelGym(g => g ? { ...g, ...editDraft } : g);
                  };
                  return (
                    <div>
                      <div className="fsec" style={{ marginBottom: 0 }}>
                        <div className="fstitle">Basic Info</div>
                        <div className="frow"><label className="flbl">Gym Name</label><input className="finput" value={ed.name ?? selGym.name} onChange={e => upd("name", e.target.value)} /></div>
                        <div className="frow"><label className="flbl">Type</label>
                          <select className="fsel" value={ed.type ?? selGym.type} onChange={e => upd("type", e.target.value)}>
                            {GYM_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="frow"><label className="flbl">Location</label><input className="finput" value={ed.location ?? selGym.location} onChange={e => upd("location", e.target.value)} /></div>
                        <div className="frow"><label className="flbl">Description</label><textarea className="ftxt" value={ed.desc ?? selGym.desc} onChange={e => upd("desc", e.target.value)} /></div>
                      </div>
                      <div className="fsec" style={{ marginTop: 18 }}>
                        <div className="fstitle">Contact & Pricing</div>
                        <div className="frow"><label className="flbl">Monthly Price (₹)</label><input className="finput" type="number" value={ed.price ?? selGym.price} onChange={e => upd("price", Number(e.target.value))} /></div>
                        <div className="frow"><label className="flbl">Phone</label><input className="finput" value={(ed as Record<string,unknown>).phone as string ?? ""} placeholder="+91 98000 00000" onChange={e => upd("phone" as keyof Gym, e.target.value)} /></div>
                        <div className="frow"><label className="flbl">Hours</label><input className="finput" value={(ed as Record<string,unknown>).hours as string ?? ""} placeholder="Mon–Sun 5am–11pm" onChange={e => upd("hours" as keyof Gym, e.target.value)} /></div>
                        <div className="frow"><label className="flbl">Rating</label><input className="finput" type="number" step="0.1" min="1" max="5" value={ed.rating ?? selGym.rating} onChange={e => upd("rating", Number(e.target.value))} /></div>
                      </div>
                      <div className="fsec" style={{ marginTop: 18 }}>
                        <div className="fstitle">Amenities</div>
                        <div className="atogls">
                          {AMENITIES.map(a => {
                            const cur: string[] = (ed.amenities ?? selGym.amenities) as string[];
                            const on = cur.includes(a);
                            return (
                              <button key={a} className={`atogl ${on ? "on" : ""}`}
                                onClick={() => upd("amenities", on ? cur.filter(x => x !== a) : [...cur, a])}>
                                {a}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="fsec" style={{ marginTop: 18 }}>
                        <div className="fstitle">Appearance</div>
                        <div className="frow"><label className="flbl">Emoji</label><input className="finput" value={ed.emoji ?? selGym.emoji} onChange={e => upd("emoji", e.target.value)} style={{ fontSize: "1.4rem" }} /></div>
                        <div className="frow"><label className="flbl">Badge</label>
                          <select className="fsel" value={(ed.badge ?? selGym.badge) || ""} onChange={e => upd("badge", e.target.value || null)}>
                            <option value="">None</option>
                            <option value="TOP RATED">TOP RATED</option>
                            <option value="PREMIUM">PREMIUM</option>
                            <option value="NEW">NEW</option>
                            <option value="HOT">HOT</option>
                          </select>
                        </div>
                      </div>
                      <button className="addbtn" style={{ marginTop: 18 }} onClick={save}>💾 SAVE CHANGES</button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── SITE DETAIL MODAL ── */}
        {selSite && (() => {
          const eq = getEq(selSite.id, selSite.type);
          const tr = getTr(selSite.id, selSite.type);
          const cats = [...new Set(eq.map(e => e.category))];
          const td = THEMES.find(t => t.id === selSite.theme) || THEMES[0];
          const price = selSite.price ? Number(selSite.price) : 0;
          const plans = [
            { id: "monthly", label: "Monthly", price, save: null },
            { id: "quarterly", label: "3 Months", price: Math.round(price * 2.7), save: "Save 10%" },
            { id: "annual", label: "Annual", price: Math.round(price * 10), save: "Save 17%" },
          ];
          return (
            <div className="overlay" onClick={() => setSelSite(null)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                {/* Hero — live website thumbnail */}
                <div style={{ width: "100%", height: "220px", position: "relative", overflow: "hidden", background: "#0a0a0a" }}>
                  <iframe
                    srcDoc={selSite.html}
                    sandbox="allow-scripts"
                    title={selSite.name}
                    style={{ width: "200%", height: "200%", transform: "scale(.5)", transformOrigin: "top left", border: "none", pointerEvents: "none" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, var(--card) 100%)" }} />
                  <div className="gbadge" style={{ position: "absolute", top: 12, left: 12, background: td.accent, color: "#000" }}>MY SITE</div>
                  <button className="mclose" onClick={() => setSelSite(null)}>✕</button>
                  <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: "6px" }}>
                    <button className="gbtn" style={{ fontSize: ".65rem", padding: "5px 10px" }} onClick={() => setViewing(selSite)}>🌐 Full View</button>
                    <button className="gbtn" style={{ fontSize: ".65rem", padding: "5px 10px", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
                      onClick={() => { setSharing(selSite); setCopied(false); }}>📤 Share</button>
                  </div>
                </div>

                <div className="mbody">
                  <div className="mtype">{selSite.type}</div>
                  <div className="mname">{selSite.name}</div>
                  <div className="mmeta">
                    <div className="mmeta-i">📍 <strong>{selSite.location}</strong></div>
                    {selSite.price && <div className="mmeta-i">💰 <strong>₹{selSite.price}/mo</strong></div>}
                    <div className="mmeta-i">🌐 <strong style={{ color: td.accent, fontSize: ".72rem", fontFamily: "monospace" }}>{selSite.url}</strong></div>
                  </div>
                  {selSite.tagline && <div style={{ fontSize: ".88rem", color: "#aaa", marginBottom: "18px", fontStyle: "italic" }}>"{selSite.tagline}"</div>}

                  {/* Tabs */}
                  <div className="mtabs">
                    {["website", "equipment", "trainers", "join"].map(t => (
                      <button key={t} className={`mtab ${selSiteMtab === t ? "active" : ""}`} onClick={() => setSelSiteMtab(t)}>
                        {t === "website" ? "🌐 Website" : t === "equipment" ? "🏋️ Equipment" : t === "trainers" ? "👤 Trainers" : "🎟 Join"}
                      </button>
                    ))}
                  </div>

                  {/* Website tab — full interactive embed */}
                  {selSiteMtab === "website" && (
                    <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
                      <div style={{ background: "#1a1a1a", padding: "7px 12px", display: "flex", gap: "6px", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
                        <div style={{ flex: 1, background: "var(--card)", borderRadius: "4px", padding: "3px 10px", fontSize: ".68rem", color: td.accent, fontFamily: "monospace" }}>{selSite.url}</div>
                        <button className="gbtn" style={{ fontSize: ".62rem", padding: "4px 10px" }} onClick={() => setViewing(selSite)}>⛶ Expand</button>
                      </div>
                      <iframe
                        srcDoc={selSite.html}
                        sandbox="allow-scripts allow-same-origin"
                        title={selSite.name}
                        style={{ width: "100%", height: "420px", border: "none", display: "block" }}
                      />
                    </div>
                  )}

                  {/* Equipment tab */}
                  {selSiteMtab === "equipment" && <>
                    <div className="sbar">
                      <div className="stn"><div className="stn-n">{eq.length}</div><div className="stn-l">Types</div></div>
                      <div className="stn"><div className="stn-n">{eq.reduce((s, e) => s + e.qty, 0)}</div><div className="stn-l">Units</div></div>
                      <div className="stn"><div className="stn-n">{cats.length}</div><div className="stn-l">Categories</div></div>
                    </div>
                    {cats.map(cat => (
                      <div key={cat}>
                        <div className="cat-title">{cat}</div>
                        <div className="eq-grid">
                          {eq.filter(e => e.category === cat).map(e => (
                            <div key={e.id} className="eq-card">
                              <button className="delbtn" onClick={() => delEq(selSite.id, selSite.type, e.id)}>✕</button>
                              {e.photo
                                ? <div className="imgw"><img src={e.photo} className="eqimg" alt={e.name} /><div className="imgch"><input type="file" accept="image/*" onChange={ev => uplEq(selSite.id, selSite.type, e.id, ev.target.files?.[0] ?? null)} /><span className="imgchl">📷</span></div></div>
                                : <div className="eqph"><input type="file" accept="image/*" onChange={ev => uplEq(selSite.id, selSite.type, e.id, ev.target.files?.[0] ?? null)} /><div className="upi">📷</div><div className="upl">Upload</div></div>
                              }
                              <div className="eqi"><div className="eqnm">{e.name}</div><div className="eqqt">Qty: {e.qty}</div></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="addform">
                      <div className="addtitle">+ Add Equipment</div>
                      <div className="addrow">
                        <input className="addinput" placeholder="Name" value={newEq.name} onChange={e => setNewEq(p => ({ ...p, name: e.target.value }))} />
                        <input className="addinput" placeholder="Category" value={newEq.category} onChange={e => setNewEq(p => ({ ...p, category: e.target.value }))} />
                      </div>
                      <div className="addrow">
                        <input className="addinput" type="number" placeholder="Qty" value={newEq.qty} onChange={e => setNewEq(p => ({ ...p, qty: Number(e.target.value) }))} />
                        <button className="addbtn" onClick={() => addEq(selSite.id, selSite.type)}>ADD</button>
                      </div>
                    </div>
                  </>}

                  {/* Trainers tab */}
                  {selSiteMtab === "trainers" && <>
                    <div className="sbar">
                      <div className="stn"><div className="stn-n">{tr.length}</div><div className="stn-l">Trainers</div></div>
                      <div className="stn"><div className="stn-n">{tr.length ? (tr.reduce((s, t) => s + t.rating, 0) / tr.length).toFixed(1) : "—"}</div><div className="stn-l">Avg Rating</div></div>
                      <div className="stn"><div className="stn-n">{tr.reduce((s, t) => s + t.sessions, 0).toLocaleString()}</div><div className="stn-l">Sessions</div></div>
                    </div>
                    <div className="tgrid">
                      {tr.map(t => (
                        <div key={t.id} className="tcard">
                          <button className="delbtn" onClick={() => delTr(selSite.id, selSite.type, t.id)}>✕</button>
                          {t.photo
                            ? <div className="imgw"><img src={t.photo} className="tavtr" alt={t.name} /><div className="imgch"><input type="file" accept="image/*" onChange={ev => uplTr(selSite.id, selSite.type, t.id, ev.target.files?.[0] ?? null)} /><span className="imgchl">📷</span></div></div>
                            : <div className="tph"><input type="file" accept="image/*" onChange={ev => uplTr(selSite.id, selSite.type, t.id, ev.target.files?.[0] ?? null)} /><div className="temoji">👤</div><div className="upl">Upload</div></div>
                          }
                          <div className="tinfo">
                            <div className="tnm">{t.name}</div>
                            <div className="trl">{t.role}</div>
                            <div className="ttags">
                              {t.speciality && <span className="ttag">🎯 {t.speciality}</span>}
                              {t.cert && <span className="ttag">🏅 {t.cert}</span>}
                              {t.exp && <span className="ttag">⏱ {t.exp}</span>}
                            </div>
                            <div className="tstats"><span className="tstat">⭐ {t.rating}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="addform">
                      <div className="addtitle">+ Add Trainer</div>
                      <div className="addrow">
                        <input className="addinput" placeholder="Full Name *" value={newTr.name} onChange={e => setNewTr(p => ({ ...p, name: e.target.value }))} />
                        <input className="addinput" placeholder="Role" value={newTr.role} onChange={e => setNewTr(p => ({ ...p, role: e.target.value }))} />
                      </div>
                      <div className="addrow">
                        <input className="addinput" placeholder="Speciality" value={newTr.speciality} onChange={e => setNewTr(p => ({ ...p, speciality: e.target.value }))} />
                        <input className="addinput" placeholder="Certification" value={newTr.cert} onChange={e => setNewTr(p => ({ ...p, cert: e.target.value }))} />
                      </div>
                      <div className="addrow">
                        <input className="addinput" placeholder="Experience" value={newTr.exp} onChange={e => setNewTr(p => ({ ...p, exp: e.target.value }))} />
                        <button className="addbtn" onClick={() => addTr(selSite.id, selSite.type)}>ADD</button>
                      </div>
                    </div>
                  </>}

                  {/* Join tab */}
                  {selSiteMtab === "join" && (() => {
                    return <>
                      <div className="jplans" style={{ marginBottom: "18px" }}>
                        {plans.map(p => (
                          <div key={p.id} className={`jplan ${jForm.plan === p.id ? "sel" : ""}`} onClick={() => setJForm(f => ({ ...f, plan: p.id }))}>
                            <div className="jpnm">{p.label}</div>
                            <div className="jppr">{p.price ? `₹${p.price}` : "—"}</div>
                            {p.save && <div className="jpsv">{p.save}</div>}
                          </div>
                        ))}
                      </div>
                      {joinFlow !== "success" ? <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "14px" }}>
                          <input className="jnput" placeholder="Full Name *" value={jForm.name} onChange={e => setJForm(f => ({ ...f, name: e.target.value }))} />
                          <input className="jnput" placeholder="WhatsApp / Phone *" value={jForm.phone} onChange={e => setJForm(f => ({ ...f, phone: e.target.value }))} />
                          <input className="jnput" placeholder="Email Address" type="email" value={jForm.email} onChange={e => setJForm(f => ({ ...f, email: e.target.value }))} />
                          <input className="jnput" placeholder="Preferred Start Date" type="date" value={jForm.startDate} onChange={e => setJForm(f => ({ ...f, startDate: e.target.value }))} />
                        </div>
                        <button className="mpbtn" disabled={!jForm.name || !jForm.phone || jLoading} onClick={submitJoin} style={{ width: "100%" }}>
                          {jLoading ? <span className="spinico">⏳</span> : `CONFIRM · ${plans.find(p => p.id === jForm.plan)?.price ? `₹${plans.find(p => p.id === jForm.plan)?.price}` : "JOIN NOW"}`}
                        </button>
                      </> : (
                        <div className="jscc">
                          <div className="jchk">✓</div>
                          <div className="jstl">YOU'RE IN!</div>
                          <div className="jsmg">Welcome to <strong style={{ color: "var(--text)" }}>{selSite.name}</strong>. Membership confirmed.</div>
                          <div className="jsdt">📋 {jForm.name} · {plans.find(p => p.id === jForm.plan)?.label} Plan<br />📍 {selSite.location}</div>
                          <button className="jsdn" onClick={() => { setJoinFlow(null); setSelSite(null); }}>DONE</button>
                        </div>
                      )}
                    </>;
                  })()}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── JOIN MODAL ── */}
        {joinFlow && selGym && (() => {
          const plans = [
            { id: "monthly", label: "Monthly", price: selGym.price, save: null },
            { id: "quarterly", label: "3 Months", price: Math.round(selGym.price * 2.7), save: "Save 10%" },
            { id: "annual", label: "Annual", price: Math.round(selGym.price * 10), save: "Save 17%" },
          ];
          return (
            <div className="joverlay" onClick={() => setJoinFlow(null)}>
              <div className="jmodal" onClick={e => e.stopPropagation()}>
                {joinFlow === "form" && <>
                  <div className="jhdr">
                    <div className="jgnm">{selGym.name}</div>
                    <div className="jsub">Membership Enrollment · {selGym.location}</div>
                    <div className="jplans">
                      {plans.map(p => (
                        <div key={p.id} className={`jplan ${jForm.plan === p.id ? "sel" : ""}`} onClick={() => setJForm(f => ({ ...f, plan: p.id }))}>
                          <div className="jpnm">{p.label}</div>
                          <div className="jppr">₹{p.price}</div>
                          {p.save && <div className="jpsv">{p.save}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="jflds">
                    <input className="jnput" placeholder="Full Name *" value={jForm.name} onChange={e => setJForm(f => ({ ...f, name: e.target.value }))} />
                    <input className="jnput" placeholder="WhatsApp / Phone *" value={jForm.phone} onChange={e => setJForm(f => ({ ...f, phone: e.target.value }))} />
                    <input className="jnput" placeholder="Email Address" type="email" value={jForm.email} onChange={e => setJForm(f => ({ ...f, email: e.target.value }))} />
                    <input className="jnput" placeholder="Preferred Start Date" type="date" value={jForm.startDate} onChange={e => setJForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="jfoot">
                    <button className="jcncl" onClick={() => setJoinFlow(null)}>Cancel</button>
                    <button className="jsbmt" disabled={!jForm.name || !jForm.phone || jLoading} onClick={submitJoin}>
                      {jLoading ? <span className="spinico">⏳</span> : `CONFIRM · ₹${plans.find(p => p.id === jForm.plan)?.price}`}
                    </button>
                  </div>
                </>}
                {joinFlow === "success" && (
                  <div className="jscc">
                    <div className="jchk">✓</div>
                    <div className="jstl">YOU'RE IN!</div>
                    <div className="jsmg">Welcome to <strong style={{ color: "var(--text)" }}>{selGym.name}</strong>. Membership confirmed.</div>
                    <div className="jsdt">📋 {jForm.name} · {plans.find(p => p.id === jForm.plan)?.label} Plan<br />📍 {selGym.location}<br />📞 WhatsApp: {jForm.phone} within 2 hrs</div>
                    <button className="jsdn" onClick={() => setJoinFlow(null)}>DONE</button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── SITE VIEWER ── */}
        {viewing && (
          <div className="viewer">
            <div className="vbar">
              <div className="vdots">
                <div className="vdot" style={{ background: "#ff5f57" }} />
                <div className="vdot" style={{ background: "#febc2e" }} />
                <div className="vdot" style={{ background: "#28c840" }} />
              </div>
              <div className="vurlbar"><span className="vlck">🔒</span>{viewing.url}</div>
              <div className="vacts">
                <button className="vbtn a" onClick={() => { setSharing(viewing); setCopied(false); }}>📤 Share</button>
                <button className="vbtn" onClick={() => dlSite(viewing)}>⬇ Download</button>
                <button className="vbtn" onClick={() => setViewing(null)}>✕ Close</button>
              </div>
            </div>
            <iframe className="viframe" srcDoc={viewing.html} title={viewing.name} sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-forms" />
          </div>
        )}

        {/* ── SHARE MODAL ── */}
        {sharing && (
          <div className="shareov" onClick={() => setSharing(null)}>
            <div className="sharemod" onClick={e => e.stopPropagation()}>
              <div className="sharetitle">SHARE SITE</div>
              <div className="sharesitename">{sharing.name} · {sharing.location}</div>
              <div className="shareurlbox">
                <div className="shareurltext">{sharing.url}</div>
                <button className={`copybtn ${copied ? "ok" : ""}`} onClick={() => copyLink(sharing.url)}>{copied ? "✓ Copied!" : "Copy Link"}</button>
              </div>
              <div className="sharelbl">Share On</div>
              <div className="shareplats">
                {SHARE_PLATFORMS.map(p => (
                  <div key={p.key} className="shareplat" onClick={() => shareOn(p.key, sharing)}>
                    <div className="spico">{p.icon}</div>
                    <div className="spnm">{p.name}</div>
                  </div>
                ))}
                <div className="shareplat" style={{ cursor: "default", gap: "8px" }}>
                  <QR val={sharing.url} />
                  <div className="spnm">QR Code</div>
                </div>
              </div>
              <button className="sharecls" onClick={() => setSharing(null)}>Close</button>
            </div>
          </div>
        )}

        {/* ── SUBSCRIPTION MODAL ── */}
        {subModal && (
          <div className="overlay" onClick={() => setSubModal(false)}>
            <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
              <div className="mbody">
                <div className="mname" style={{ fontSize: "2rem", marginBottom: "4px" }}>UPGRADE PLAN</div>
                <div className="mtype" style={{ marginBottom: "24px" }}>Current: {subscription?.plan || "Free"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                  {[
                    { plan: "free", name: "Free", price: "₹0", period: "forever", features: ["3 websites", "AI generation", "All sections", "Download HTML"], color: "var(--border)" },
                    { plan: "pro", name: "Pro", price: "₹499", period: "/month", features: ["Unlimited websites", "Custom subdomain", "Email notifications", "Priority support", "Remove branding"], color: "var(--accent)" },
                    { plan: "agency", name: "Agency", price: "₹1999", period: "/month", features: ["Everything in Pro", "White label", "Client management", "API access", "Dedicated support"], color: "var(--accent2)" },
                  ].map((p, i) => (
                    <div key={p.plan} style={{ background: i === 1 ? "rgba(232,255,0,.05)" : "var(--surface)", border: `2px solid ${subscription?.plan === p.plan ? p.color : "var(--border)"}`, borderRadius: "12px", padding: "20px", position: "relative" }}>
                      {i === 1 && <div style={{ position: "absolute", top: "-11px", left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#000", fontFamily: "var(--fc)", fontSize: ".62rem", fontWeight: 700, letterSpacing: "1.5px", padding: "2px 12px", borderRadius: "20px" }}>POPULAR</div>}
                      <div style={{ fontFamily: "var(--fc)", fontSize: ".72rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: p.color, marginBottom: "8px" }}>{p.name}</div>
                      <div style={{ fontFamily: "var(--fd)", fontSize: "2rem", letterSpacing: "1px", color: "var(--text)", lineHeight: 1 }}>{p.price}</div>
                      <div style={{ fontSize: ".72rem", color: "var(--muted)", marginBottom: "16px" }}>{p.period}</div>
                      {p.features.map(f => <div key={f} style={{ fontSize: ".75rem", color: "#aaa", padding: "4px 0", borderBottom: "1px solid #1a1a1a", display: "flex", gap: "6px" }}><span style={{ color: p.color }}>✓</span>{f}</div>)}
                      {p.plan !== "free" && subscription?.plan !== p.plan && (
                        <button style={{ width: "100%", marginTop: "16px", padding: "10px", borderRadius: "7px", cursor: "pointer", fontFamily: "var(--fc)", fontSize: ".8rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", background: p.color, color: i === 1 ? "#000" : "#fff", border: "none" }}
                          onClick={() => handleUpgrade(p.plan as "pro" | "agency")}>
                          Pay with Razorpay
                        </button>
                      )}
                      {subscription?.plan === p.plan && <div style={{ marginTop: "16px", textAlign: "center", fontFamily: "var(--fc)", fontSize: ".72rem", fontWeight: 700, letterSpacing: "1px", color: p.color }}>✓ Current Plan</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── AUTH MODAL ── */}
        {authModal && (
          <div className="overlay" onClick={() => setAuthModal(false)}>
            <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <div className="mbody">
                <div className="mname" style={{ fontSize: "2rem", marginBottom: "6px" }}>{authMode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}</div>
                <div className="mtype" style={{ marginBottom: "20px" }}>Save your sites, access from anywhere</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <input className="finput" type="email" placeholder="Email address" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
                  <input className="finput" type="password" placeholder="Password" value={authPass} onChange={e => setAuthPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} />
                </div>
                {authErr && <div style={{ fontSize: ".8rem", color: "var(--accent2)", marginBottom: "12px" }}>{authErr}</div>}
                <button className="mpbtn" style={{ width: "100%", marginBottom: "10px" }} onClick={handleAuth} disabled={authLoading}>
                  {authLoading ? "..." : authMode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
                </button>
                <button className="msbtn" style={{ width: "100%" }} onClick={() => setAuthMode(m => m === "login" ? "signup" : "login")}>
                  {authMode === "login" ? "No account? Sign up" : "Have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── VERSION VIEWER ── */}
        {viewingVersion && versionSite && (
          <div className="viewer" style={{ zIndex: 550 }}>
            <div className="vbar">
              <div className="vdots"><div className="vdot" style={{ background: "#ff5f57" }} /><div className="vdot" style={{ background: "#febc2e" }} /><div className="vdot" style={{ background: "#28c840" }} /></div>
              <div className="vurlbar"><span className="vlck">🔒</span>{versionSite.url} <span style={{ color: "var(--muted)", fontSize: ".65rem" }}>· {viewingVersion.createdAt}</span></div>
              <div className="vacts">
                <button className="vbtn" onClick={() => { setSites(p => p.map(s => s.id === versionSite.id ? { ...s, html: viewingVersion.html } : s)); setViewingVersion(null); setVersionSite(null); }}>↩ Restore</button>
                <button className="vbtn" onClick={() => { setViewingVersion(null); setVersionSite(null); }}>✕ Close</button>
              </div>
            </div>
            <iframe className="viframe" srcDoc={viewingVersion.html} title="version" sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-forms" />
          </div>
        )}

        {/* ── ONBOARDING ── */}
        {onboarding && (() => {
          const steps = [
            { title: "WELCOME TO DESHGYM", desc: "India's gym discovery + website builder platform. Let's show you around in 3 quick steps." },
            { title: "BROWSE GYMS", desc: "Discover gyms across India. Filter by type, price, location. Click any card to see details, equipment, trainers and join." },
            { title: "CREATE YOUR SITE", desc: "Fill in your gym details, add trainers, equipment, pricing and reviews — then hit Generate to get a full website in seconds." },
            { title: "MANAGE & SHARE", desc: "My Sites shows all your generated websites. View analytics, edit & regenerate, duplicate, share on WhatsApp/social, or list in Browse." },
          ];
          const step = steps[obStep];
          const done = () => { localStorage.setItem("dg_ob", "1"); setOnboarding(false); };
          return (
            <div className="ob-overlay" onClick={done}>
              <div className="ob-card" onClick={e => e.stopPropagation()}>
                <div className="ob-dots">{steps.map((_, i) => <div key={i} className={`ob-dot ${i === obStep ? "on" : ""}`} />)}</div>
                <div className="ob-step">Step {obStep + 1} of {steps.length}</div>
                <div className="ob-title">{step.title}</div>
                <div className="ob-desc">{step.desc}</div>
                <div className="ob-actions">
                  {obStep < steps.length - 1
                    ? <button className="ob-next" onClick={() => setObStep(s => s + 1)}>NEXT →</button>
                    : <button className="ob-next" onClick={done}>LET'S GO →</button>
                  }
                  <button className="ob-skip" onClick={done}>Skip</button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
