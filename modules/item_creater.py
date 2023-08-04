# coding=utf-8
import json
from io import BytesIO

import gradio as gr
import oss2
import requests
from PIL import Image
from snowflake import SnowflakeGenerator

auth = oss2.Auth("LTAI5tQnLUQgZSY9xy7rz2fL", "eIVPKw6R7eSv2Mt2EJ6ZJJ9Rh3HKqJ")
bucket = oss2.Bucket(auth, "oss-cn-hangzhou.aliyuncs.com/", "zy-pic-items-test")
zy_backend_url = "http://api.zy.greatleapai.com/items/create_txt2img_sd"
zy_backend_subcoin_url = "http://api.zy.greatleapai.com/items/create_subcoin"
aigc_id_gen = SnowflakeGenerator(1023)
REMEMBER_COOKIE_NAME = "greatleapai_token"


def gen_aigc_oss_id():
    val = next(aigc_id_gen)
    return val


def call_zy_backend(conn: gr.Request, url, data):
    rsp = requests.post(
        url,
        json=data,
        cookies={
            REMEMBER_COOKIE_NAME: conn.cookies[REMEMBER_COOKIE_NAME],
        },
    )

    return rsp.status_code, rsp.text


def create_aigc_item_subcoin(conn: gr.Request, model_name, input_data):
    data = {"model_name": model_name, "input_data": input_data}

    status_code, rsp_text = call_zy_backend(conn, zy_backend_subcoin_url, data)
    if status_code != 200:
        return False, 0

    rsp = json.loads(rsp_text)
    data = rsp.get("data", {})
    print(rsp_text)

    return True, data["coin"]


def create_aigc_item(conn: gr.Request, model_name, input_data, images_gen, gen_info):

    images = []
    if len(images_gen) > 1:  # 第一张是混合的缩略图，处理下
        images_gen = images_gen[1:]

    for image in images_gen:
        id = gen_aigc_oss_id()
        oss_name = "{}.png".format(id)

        buf = BytesIO()
        image.save(buf, "png")

        img_data = buf.getvalue()
        result = bucket.put_object(oss_name, img_data)
        buf.close()

        images.append({"url": "http://cdn.greatleapai.com/{}".format(oss_name), "size": len(img_data)})

    data = {
        "gen_meta": json.loads(gen_info),
        "model_name": model_name,
        "input_data": input_data,
        "images": images,
    }

    status_code, rsp_text = call_zy_backend(conn, zy_backend_url, data)
    print("request rsp: ", status_code, rsp_text)


if __name__ == "__main__":

    image = Image.open("/Users/zhumeiqi/Downloads/test.png")
    buf = BytesIO()
    image.save(buf, "png")

    result = bucket.put_object("test.png", buf.getvalue())
    buf.close()
    print(result)
