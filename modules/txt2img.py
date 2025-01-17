import gradio as gr

import modules.scripts
import modules.shared as shared
from modules import processing
from modules import sd_samplers
from modules.generation_parameters_copypaste import create_override_settings_dict
from modules.item_creater import create_aigc_item
from modules.item_creater import create_aigc_item_subcoin
from modules.shared import cmd_opts
from modules.shared import opts
from modules.ui import plaintext_to_html


def txt2img(
    r: gr.Request,
    id_task: str,
    prompt: str,
    negative_prompt: str,
    prompt_styles,
    steps: int,
    sampler_index: int,
    restore_faces: bool,
    tiling: bool,
    n_iter: int,
    batch_size: int,
    cfg_scale: float,
    seed: int,
    subseed: int,
    subseed_strength: float,
    seed_resize_from_h: int,
    seed_resize_from_w: int,
    seed_enable_extras: bool,
    height: int,
    width: int,
    enable_hr: bool,
    denoising_strength: float,
    hr_scale: float,
    hr_upscaler: str,
    hr_second_pass_steps: int,
    hr_resize_x: int,
    hr_resize_y: int,
    hr_sampler_index: int,
    hr_prompt: str,
    hr_negative_prompt,
    override_settings_texts,
    *args,
):

    override_settings = create_override_settings_dict(override_settings_texts)
    p = processing.StableDiffusionProcessingTxt2Img(
        sd_model=shared.sd_model,
        outpath_samples=opts.outdir_samples or opts.outdir_txt2img_samples,
        outpath_grids=opts.outdir_grids or opts.outdir_txt2img_grids,
        prompt=prompt,
        styles=prompt_styles,
        negative_prompt=negative_prompt,
        seed=seed,
        subseed=subseed,
        subseed_strength=subseed_strength,
        seed_resize_from_h=seed_resize_from_h,
        seed_resize_from_w=seed_resize_from_w,
        seed_enable_extras=seed_enable_extras,
        sampler_name=sd_samplers.samplers[sampler_index].name,
        batch_size=batch_size,
        n_iter=n_iter,
        steps=steps,
        cfg_scale=cfg_scale,
        width=width,
        height=height,
        restore_faces=restore_faces,
        tiling=tiling,
        enable_hr=enable_hr,
        denoising_strength=denoising_strength if enable_hr else None,
        hr_scale=hr_scale,
        hr_upscaler=hr_upscaler,
        hr_second_pass_steps=hr_second_pass_steps,
        hr_resize_x=hr_resize_x,
        hr_resize_y=hr_resize_y,
        hr_sampler_name=sd_samplers.samplers_for_img2img[hr_sampler_index - 1].name if hr_sampler_index != 0 else None,
        hr_prompt=hr_prompt,
        hr_negative_prompt=hr_negative_prompt,
        override_settings=override_settings,
    )

    p.scripts = modules.scripts.scripts_txt2img
    p.script_args = args

    if cmd_opts.enable_console_prompts:
        print(f"\ntxt2img: {prompt}", file=shared.progress_print_out)

    model_name = shared.sd_model.sd_checkpoint_info.model_name
    input_data = {
        "prompt": prompt,
        "styles": prompt_styles,
        "negative_prompt": negative_prompt,
        "seed": seed,
        "subseed": subseed,
        "subseed_strength": subseed_strength,
        "seed_resize_from_h": seed_resize_from_h,
        "seed_resize_from_w": seed_resize_from_w,
        "seed_enable_extras": seed_enable_extras,
        "sampler_index": sampler_index,
        "sampler_name": sd_samplers.samplers[sampler_index].name,
        "batch_size": batch_size,
        "n_iter": n_iter,
        "steps": steps,
        "cfg_scale": cfg_scale,
        "width": width,
        "height": height,
        "restore_faces": restore_faces,
        "tiling": tiling,
        "enable_hr": enable_hr,
        "denoising_strength": denoising_strength if enable_hr else None,
        "hr_scale": hr_scale,
        "hr_upscaler": hr_upscaler,
        "hr_second_pass_steps": hr_second_pass_steps,
        "hr_resize_x": hr_resize_x,
        "hr_resize_y": hr_resize_y,
        "hr_sampler_name": sd_samplers.samplers_for_img2img[hr_sampler_index - 1].name
        if hr_sampler_index != 0
        else None,
        "hr_sampler_index": hr_sampler_index,
        "hr_prompt": hr_prompt,
        "hr_negative_prompt": hr_negative_prompt,
        "override_settings": override_settings,
        "vae": shared.opts.sd_vae,
    }

    succ, coin = create_aigc_item_subcoin(r, "txt2img", model_name, input_data)
    if not succ:
        return [], "", plaintext_to_html("扣除金币失败"), plaintext_to_html("{}".format(coin))

    processed = modules.scripts.scripts_txt2img.run(p, *args)

    if processed is None:
        processed = processing.process_images(p)

    p.close()

    shared.total_tqdm.clear()

    generation_info_js = processed.js()
    if opts.samples_log_stdout:
        print(generation_info_js)

    if opts.do_not_show_images:
        processed.images = []

    succ = create_aigc_item(r, "txt2img", model_name, input_data, processed.images, generation_info_js)

    if not succ:
        processed.info = "保存图片信息失败，请手动保存:" + processed.info

    return (
        processed.images,
        generation_info_js,
        plaintext_to_html(processed.info + "\nCost:{}".format(coin)),
        plaintext_to_html(processed.comments),
    )
