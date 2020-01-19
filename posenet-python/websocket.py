
import asyncio
import websockets
import image_demo

async def hello(websocket, path):
    while True:
        img = await websocket.recv()
        
        ret = image_demo.compute(img)
        await websocket.send(ret)

start_server = websockets.serve(hello, "0.0.0.0", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()