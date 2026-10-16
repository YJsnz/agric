#include "ty_serial.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>
static int received=0;
static void accept(const ty_frame *f,void *ctx) {
    assert(f->address==3);assert(f->kind==*(const int*)ctx);assert(f->sequence==123456);assert(f->length==2);assert(memcmp(f->payload,"{}",2)==0);received++;
}
int main(void) {
    assert(ty_crc16((const uint8_t*)"123456789",9)==0x4b37);
    uint8_t packet[TY_MAX_FRAME];ty_frame f={3,TY_COMMAND,123456,2,(const uint8_t*)"{}"};size_t length=ty_encode(&f,packet,sizeof(packet));assert(length==15);
    /* Golden vector from Python encode(Frame(3, COMMAND, 123456, {})). */
    const uint8_t golden[]={0xaa,0x55,0x01,0x03,0x02,0x40,0xe2,0x01,0x00,0x02,0x00,0x7b,0x7d,0xcf,0xf1};
    assert(memcmp(packet,golden,sizeof(golden))==0);
    int kind=TY_COMMAND;ty_decoder decoder={0};ty_feed(&decoder,0,accept,&kind);
    for(size_t i=0;i<length;i++)ty_feed(&decoder,packet[i],accept,&kind);
    assert(received==1);packet[length-1]^=1;
    for(size_t i=0;i<length;i++)ty_feed(&decoder,packet[i],accept,&kind);
    assert(received==1);packet[length-1]^=1;
    for(size_t i=0;i<length;i++)ty_feed(&decoder,packet[i],accept,&kind);
    assert(received==2);assert(decoder.rejected>0);kind=TY_VEHICLE_EVENT;f.kind=TY_VEHICLE_EVENT;length=ty_encode(&f,packet,sizeof(packet));assert(length==15);for(size_t i=0;i<length;i++)ty_feed(&decoder,packet[i],accept,&kind);assert(received==3);puts("firmware codec OK");return 0;
}
