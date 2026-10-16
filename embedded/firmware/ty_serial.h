#ifndef TY_SERIAL_H
#define TY_SERIAL_H
#include <stddef.h>
#include <stdint.h>
#define TY_VEHICLE_EVENT 5
#define TY_MAX_PAYLOAD 2048
#define TY_MAX_FRAME (TY_MAX_PAYLOAD + 13)
enum { TY_TELEMETRY=1, TY_COMMAND=2, TY_ACK=3, TY_HELLO=4 };
typedef struct { uint8_t address, kind; uint32_t sequence; uint16_t length; const uint8_t *payload; } ty_frame;
typedef struct { uint8_t bytes[TY_MAX_FRAME]; size_t used; uint32_t rejected; } ty_decoder;
/* Callback payload remains valid only during callback. Copy before asynchronous processing. */
typedef void (*ty_receive)(const ty_frame *frame, void *context);
uint16_t ty_crc16(const uint8_t *data, size_t length);
size_t ty_encode(const ty_frame *frame, uint8_t *output, size_t capacity);
void ty_feed(ty_decoder *decoder, uint8_t byte, ty_receive receive, void *context);
/* Call from UART idle handling after 250 ms without a byte to discard truncated frames. */
void ty_reset(ty_decoder *decoder);
#endif
