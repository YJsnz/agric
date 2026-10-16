#include "ty_serial.h"
#include <string.h>
static uint16_t u16(const uint8_t *p) { return (uint16_t)(p[0] | ((uint16_t)p[1]<<8)); }
static uint32_t u32(const uint8_t *p) { return (uint32_t)p[0] | ((uint32_t)p[1]<<8) | ((uint32_t)p[2]<<16) | ((uint32_t)p[3]<<24); }
uint16_t ty_crc16(const uint8_t *data, size_t length) {
    uint16_t crc=0xffff;
    for(size_t i=0;i<length;i++) { crc^=data[i]; for(int bit=0;bit<8;bit++) crc=(uint16_t)((crc>>1)^((crc&1)?0xa001:0)); }
    return crc;
}
size_t ty_encode(const ty_frame *f, uint8_t *out, size_t capacity) {
    if(!f || !out || f->length>TY_MAX_PAYLOAD || capacity<(size_t)f->length+13 || f->address<1 || f->address>247 || f->kind<1 || f->kind>5 || (f->length&&!f->payload))return 0;
    out[0]=0xaa;out[1]=0x55;out[2]=1;out[3]=f->address;out[4]=f->kind;
    for(int i=0;i<4;i++)out[5+i]=(uint8_t)(f->sequence>>(i*8));
    out[9]=(uint8_t)f->length;out[10]=(uint8_t)(f->length>>8);
    if(f->length)memcpy(out+11,f->payload,f->length);
    uint16_t crc=ty_crc16(out+2,(size_t)f->length+9);out[11+f->length]=(uint8_t)crc;out[12+f->length]=(uint8_t)(crc>>8);
    return (size_t)f->length+13;
}
static void discard(ty_decoder *d) { if(d->used) { memmove(d->bytes,d->bytes+1,--d->used); } }
void ty_reset(ty_decoder *d) { if(d && d->used) {d->used=0;d->rejected++;} }
void ty_feed(ty_decoder *d, uint8_t byte, ty_receive receive, void *context) {
    if(!d || !receive)return;
    if(d->used>=TY_MAX_FRAME){d->rejected++;discard(d);}
    d->bytes[d->used++]=byte;
    while(d->used) {
        if(d->bytes[0]!=0xaa){discard(d);continue;}
        if(d->used<2)return;
        if(d->bytes[1]!=0x55){discard(d);continue;}
        if(d->used<11)return;
        uint16_t len=u16(d->bytes+9);
        if(d->bytes[2]!=1 || d->bytes[3]<1 || d->bytes[3]>247 || d->bytes[4]<1 || d->bytes[4]>5 || len>TY_MAX_PAYLOAD){d->rejected++;discard(d);continue;}
        size_t total=(size_t)len+13;if(d->used<total)return;
        if(ty_crc16(d->bytes+2,(size_t)len+9)!=u16(d->bytes+11+len)){d->rejected++;discard(d);continue;}
        ty_frame f={d->bytes[3],d->bytes[4],u32(d->bytes+5),len,d->bytes+11};receive(&f,context);
        d->used-=total;memmove(d->bytes,d->bytes+total,d->used);
    }
}
