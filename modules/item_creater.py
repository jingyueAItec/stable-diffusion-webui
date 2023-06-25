# coding=utf-8
from PIL import Image
import oss2
from io import BytesIO
from snowflake import SnowflakeGenerator
import gradio as gr
import requests

auth = oss2.Auth("LTAI5tQnLUQgZSY9xy7rz2fL", "eIVPKw6R7eSv2Mt2EJ6ZJJ9Rh3HKqJ")
bucket = oss2.Bucket(
    auth, 'oss-cn-hangzhou.aliyuncs.com/', 'zy-pic-items-test')
zy_backend_url = "http://api.zy.greatleapai.com/items/create_txt2img_sd"
aigc_id_gen = SnowflakeGenerator(1023)
REMEMBER_COOKIE_NAME = 'greatleapai_token'


def gen_aigc_oss_id():
    val = next(aigc_id_gen)
    return val


def create_aigc_item(conn: gr.Request, images, info):

    images = []
    for image in images:
        id = gen_aigc_oss_id()
        oss_name = "{}.png".format(id)

        buf = BytesIO()
        image.save(buf, 'png')

        img_data = buf.getvalue()
        result = bucket.put_object(oss_name, img_data)
        buf.close()

        images.append({
            "url": "http://cdn.greatleapai.com/{}".format(oss_name),
            "size": len(img_data)
        })

    import json
    data = {
        "meta": json.loads(info),
        "images": images,
    }

    rsp = requests.post(zy_backend_url, json=data, cookies={
        REMEMBER_COOKIE_NAME: conn.cookies.get(REMEMBER_COOKIE_NAME, '')
    })
    print("request rsp: ", rsp.status_code, rsp.text)


if __name__ == "__main__":

    image = Image.open("/Users/zhumeiqi/Downloads/test.png")
    buf = BytesIO()
    image.save(buf, 'png')

    result = bucket.put_object('test.png', buf.getvalue())
    buf.close()
    print(result)
