import { Peer } from 'peerjs';

export class ShiftNetwork {
  constructor(handlers = {}) { this.peer=null; this.conn=null; this.isHost=false; this.roomCode=''; this.handlers=handlers; }
  host() { const code=Math.random().toString(36).slice(2,8).toUpperCase(); return this.open('shift-'+code,true,code); }
  join(code) { const clean=String(code||'').trim().toUpperCase(); if(!/^[A-Z0-9]{4,8}$/.test(clean)) return Promise.reject(new Error('Invalid room code')); return this.open('shift-'+crypto.randomUUID().slice(0,8),false,clean); }
  open(id,isHost,code) { return new Promise((resolve,reject)=>{
    this.isHost=isHost; this.roomCode=code; this.peer=new Peer(id);
    const timeout=setTimeout(()=>reject(new Error('timeout')),12000);
    this.peer.on('open',()=>{ clearTimeout(timeout); if(isHost) resolve({role:'host',roomCode:code}); else this.attach(this.peer.connect('shift-'+code,{reliable:true}),resolve,reject); });
    this.peer.on('connection',c=>{ if(this.isHost) this.attach(c,resolve,reject); });
    this.peer.on('error',reject);
  });}
  attach(c,resolve,reject){ this.conn=c; c.on('open',()=>{this.handlers.onRemoteJoin?.();resolve({role:this.isHost?'host':'client',roomCode:this.roomCode});}); c.on('data',d=>{if(d?.type==='state')this.handlers.onRemoteState?.(d.state);else this.handlers.onMessage?.(d);}); c.on('close',()=>this.handlers.onRemoteLeave?.()); c.on('error',reject); }
  send(type,payload={}) { if(this.conn?.open)this.conn.send({type,...payload}); }
  close(){try{this.conn?.close();this.peer?.destroy();}catch{} this.conn=null;this.peer=null;}
}
