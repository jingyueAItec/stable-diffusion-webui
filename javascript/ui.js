// various functions for interaction with ui.py not large enough to warrant putting them in separate files

function set_theme(theme) {
    var gradioURL = window.location.href;
    if (!gradioURL.includes('?__theme=')) {
        window.location.replace(gradioURL + '?__theme=' + theme);
    }
}

function all_gallery_buttons() {
    var allGalleryButtons = gradioApp().querySelectorAll('[style="display: block;"].tabitem div[id$=_gallery].gradio-gallery .thumbnails > .thumbnail-item.thumbnail-small');
    var visibleGalleryButtons = [];
    allGalleryButtons.forEach(function(elem) {
        if (elem.parentElement.offsetParent) {
            visibleGalleryButtons.push(elem);
        }
    });
    return visibleGalleryButtons;
}

function selected_gallery_button() {
    var allCurrentButtons = gradioApp().querySelectorAll('[style="display: block;"].tabitem div[id$=_gallery].gradio-gallery .thumbnail-item.thumbnail-small.selected');
    var visibleCurrentButton = null;
    allCurrentButtons.forEach(function(elem) {
        if (elem.parentElement.offsetParent) {
            visibleCurrentButton = elem;
        }
    });
    return visibleCurrentButton;
}

function selected_gallery_index() {
    var buttons = all_gallery_buttons();
    var button = selected_gallery_button();

    var result = -1;
    buttons.forEach(function(v, i) {
        if (v == button) {
            result = i;
        }
    });

    return result;
}

function extract_image_from_gallery(gallery) {
    if (gallery.length == 0) {
        return [null];
    }
    if (gallery.length == 1) {
        return [gallery[0]];
    }

    var index = selected_gallery_index();

    if (index < 0 || index >= gallery.length) {
        // Use the first image in the gallery as the default
        index = 0;
    }

    return [gallery[index]];
}

window.args_to_array = Array.from; // Compatibility with e.g. extensions that may expect this to be around

function switch_to_txt2img() {
    gradioApp().querySelector('#tabs').querySelectorAll('button')[0].click();

    return Array.from(arguments);
}

function switch_to_img2img_tab(no) {
    gradioApp().querySelector('#tabs').querySelectorAll('button')[1].click();
    gradioApp().getElementById('mode_img2img').querySelectorAll('button')[no].click();
}
function switch_to_img2img() {
    switch_to_img2img_tab(0);
    return Array.from(arguments);
}

function switch_to_sketch() {
    switch_to_img2img_tab(1);
    return Array.from(arguments);
}

function switch_to_inpaint() {
    switch_to_img2img_tab(2);
    return Array.from(arguments);
}

function switch_to_inpaint_sketch() {
    switch_to_img2img_tab(3);
    return Array.from(arguments);
}

function switch_to_extras() {
    gradioApp().querySelector('#tabs').querySelectorAll('button')[2].click();

    return Array.from(arguments);
}

function get_tab_index(tabId) {
    let buttons = gradioApp().getElementById(tabId).querySelector('div').querySelectorAll('button');
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].classList.contains('selected')) {
            return i;
        }
    }
    return 0;
}

function create_tab_index_args(tabId, args) {
    var res = Array.from(args);
    res[0] = get_tab_index(tabId);
    return res;
}

function get_img2img_tab_index() {
    let res = Array.from(arguments);
    res.splice(-2);
    res[0] = get_tab_index('mode_img2img');
    return res;
}

function create_submit_args(args) {
    var res = Array.from(args);

    // As it is currently, txt2img and img2img send back the previous output args (txt2img_gallery, generation_info, html_info) whenever you generate a new image.
    // This can lead to uploading a huge gallery of previously generated images, which leads to an unnecessary delay between submitting and beginning to generate.
    // I don't know why gradio is sending outputs along with inputs, but we can prevent sending the image gallery here, which seems to be an issue for some.
    // If gradio at some point stops sending outputs, this may break something
    if (Array.isArray(res[res.length - 3])) {
        res[res.length - 3] = null;
    }

    return res;
}

function showSubmitButtons(tabname, show) {
    gradioApp().getElementById(tabname + '_interrupt').style.display = show ? "none" : "block";
    gradioApp().getElementById(tabname + '_skip').style.display = show ? "none" : "block";
}

function showRestoreProgressButton(tabname, show) {
    var button = gradioApp().getElementById(tabname + "_restore_progress");
    if (!button) return;

    button.style.display = show ? "flex" : "none";
}

function submit() {
    showSubmitButtons('txt2img', false);

    var id = randomId();
    localStorage.setItem("txt2img_task_id", id);

    requestProgress(id, gradioApp().getElementById('txt2img_gallery_container'), gradioApp().getElementById('txt2img_gallery'), function() {
        showSubmitButtons('txt2img', true);
        localStorage.removeItem("txt2img_task_id");
        showRestoreProgressButton('txt2img', false);
    });

    var res = create_submit_args(arguments);

    res[0] = id;

    return res;
}

function submit_img2img() {
    showSubmitButtons('img2img', false);

    var id = randomId();
    localStorage.setItem("img2img_task_id", id);

    requestProgress(id, gradioApp().getElementById('img2img_gallery_container'), gradioApp().getElementById('img2img_gallery'), function() {
        showSubmitButtons('img2img', true);
        localStorage.removeItem("img2img_task_id");
        showRestoreProgressButton('img2img', false);
    });

    var res = create_submit_args(arguments);

    res[0] = id;
    res[1] = get_tab_index('mode_img2img');

    return res;
}

function restoreProgressTxt2img() {
    showRestoreProgressButton("txt2img", false);
    var id = localStorage.getItem("txt2img_task_id");

    id = localStorage.getItem("txt2img_task_id");

    if (id) {
        requestProgress(id, gradioApp().getElementById('txt2img_gallery_container'), gradioApp().getElementById('txt2img_gallery'), function() {
            showSubmitButtons('txt2img', true);
        }, null, 0);
    }

    return id;
}

function restoreProgressImg2img() {
    showRestoreProgressButton("img2img", false);

    var id = localStorage.getItem("img2img_task_id");

    if (id) {
        requestProgress(id, gradioApp().getElementById('img2img_gallery_container'), gradioApp().getElementById('img2img_gallery'), function() {
            showSubmitButtons('img2img', true);
        }, null, 0);
    }

    return id;
}


onUiLoaded(function() {
    console.log("pjello world2")
    showRestoreProgressButton('txt2img', localStorage.getItem("txt2img_task_id"));
    showRestoreProgressButton('img2img', localStorage.getItem("img2img_task_id"));
	var mutationObserver = new MutationObserver(function (m) {
		if (gradioApp().querySelector('#setting_sd_model_checkpoint')) {
			// console.log(gradio_config.components.find(e => e.props.elem_id === "setting_sd_model_checkpoint").props.value)
			console.log(gradioApp().querySelector('#setting_sd_model_checkpoint').querySelector('input').value);
		}
	});
	mutationObserver.observe(gradioApp().getElementById('quicksettings').querySelector('input'), { attributes: true });
	setTimeout(function () {
		// 从当前URL中获取type、itemId和modelId参数
		const urlParams = new URLSearchParams(window.location.search);
		const type = urlParams.get('type');
		const itemId = urlParams.get('itemId');
		const modelId = urlParams.get('modelId');

		if (!type) return;

		let data = {};
		let link = '';

		if (type === 'model') {
			// 构建请求体数据
			data = {
				'model_id': +modelId
			};
			link = 'https://api-zy.greatleapai.com/models/detail';
		} else if (type === 'lora' || type === 'text2img' || type === 'img2img') {
			// 构建请求体数据
			data = {
				'item_id': itemId
			};
			link = 'https://api-zy.greatleapai.com/items/draw_info';
		}

		// 构建请求头，包含cookies
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');

		// 发送请求
		fetch(link, {
			method: 'POST',
			headers: headers,
			credentials: 'include', // 发送包含cookies的请求
			body: JSON.stringify(data)
		})
			.then(response => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error('Request failed. Status: ' + response.status);
				}
			})
			.then(res => {
				// console.log(res);

				if (type === 'model') {
					let model = res.data.detail;
					let component1 = gradio_config.components.find(e => e.props.elem_id === "setting_sd_model_checkpoint");
					component1.instance.$$set({ value: model.path });
					return;
				}

				let item = res.data.item_meta.item;
				let model = res.data.item_meta.model;

				if (type === 'lora') {
					let component3 = gradio_config.components.find(e => e.props.elem_id === "txt2img_prompt");
					component3.instance.$$set({ value: item.prompt });
				}
				else if (type === 'text2img') {
					gradioApp().querySelector('#tabs').querySelectorAll('button')[0].click();

					let component1 = gradio_config.components.find(e => e.props.elem_id === "setting_sd_model_checkpoint");
					component1.instance.$$set({ value: model.path });

					let component2 = gradio_config.components.find(e => e.props.elem_id === "setting_sd_vae");
					component2.instance.$$set({ value: item.vae });

					let component22 = gradio_config.components.find(e => e.props.elem_id === "setting_CLIP_stop_at_last_layers");
					component22.instance.$$set({ value: item.clipskip });

					let component3 = gradio_config.components.find(e => e.props.elem_id === "txt2img_prompt");
					component3.instance.$$set({ value: item.prompt });

					let component4 = gradio_config.components.find(e => e.props.elem_id === "txt2img_neg_prompt");
					component4.instance.$$set({ value: item.negative_prompt });

					let component5 = gradio_config.components.find(e => e.props.elem_id === "txt2img_sampling");
					component5.instance.$$set({ value: item.sampler });

					let component6 = gradio_config.components.find(e => e.props.elem_id === "txt2img_steps");
					component6.instance.$$set({ value: item.steps });

					let component7 = gradio_config.components.find(e => e.props.elem_id === "txt2img_restore_faces");
					component7.instance.$$set({ value: item.restore_faces });

					let component8 = gradio_config.components.find(e => e.props.elem_id === "txt2img_width");
					component8.instance.$$set({ value: item.width });

					let component9 = gradio_config.components.find(e => e.props.elem_id === "txt2img_height");
					component9.instance.$$set({ value: item.height });

					let component10 = gradio_config.components.find(e => e.props.elem_id === "txt2img_cfg_scale");
					component10.instance.$$set({ value: item.cfgs });

					let component11 = gradio_config.components.find(e => e.props.elem_id === "txt2img_seed");
					component11.instance.$$set({ value: item.seed });
				}
				else if (type === 'img2img') {
					gradioApp().querySelector('#tabs').querySelectorAll('button')[1].click();
					let component3 = gradio_config.components.find(e => e.props.elem_id === "img2img_prompt");
					component3.instance.$$set({ value: item.prompt });

					let component4 = gradio_config.components.find(e => e.props.elem_id === "img2img_neg_prompt");
					component4.instance.$$set({ value: item.negative_prompt });

					var a = gradio_config.components.find(e => e.props.elem_id === "img2img_image");

					function convertImageToBase64(url) {
						return fetch(url)
							.then(response => response.blob())
							.then(blob => {
								return new Promise((resolve, reject) => {
									const reader = new FileReader();
									reader.onloadend = () => {
										const base64Data = reader.result;
										resolve(base64Data);
									};
									reader.onerror = reject;
									reader.readAsDataURL(blob);
								});
							});
					}

					// 使用示例
					const imageUrl = item.icon

					convertImageToBase64(imageUrl)
						.then(base64Data => {
							// console.log(base64Data); // 输出图片的 Base64 字符串
							a.instance.$$set({ value: base64Data });
						})
						.catch(error => {
							console.error('Failed to convert image to Base64:', error);
						});
				}
			})
			.catch(error => {
				console.error(error);
				// 在这里处理请求错误
			});

	}, 2000);
});


function modelmerger() {
    var id = randomId();
    requestProgress(id, gradioApp().getElementById('modelmerger_results_panel'), null, function() {});

    var res = create_submit_args(arguments);
    res[0] = id;
    return res;
}


function ask_for_style_name(_, prompt_text, negative_prompt_text) {
    var name_ = prompt('Style name:');
    return [name_, prompt_text, negative_prompt_text];
}

function confirm_clear_prompt(prompt, negative_prompt) {
    if (confirm("Delete prompt?")) {
        prompt = "";
        negative_prompt = "";
    }

    return [prompt, negative_prompt];
}


var promptTokecountUpdateFuncs = {};

function recalculatePromptTokens(name) {
    if (promptTokecountUpdateFuncs[name]) {
        promptTokecountUpdateFuncs[name]();
    }
}

function recalculate_prompts_txt2img() {
    recalculatePromptTokens('txt2img_prompt');
    recalculatePromptTokens('txt2img_neg_prompt');
    return Array.from(arguments);
}

function recalculate_prompts_img2img() {
    recalculatePromptTokens('img2img_prompt');
    recalculatePromptTokens('img2img_neg_prompt');
    return Array.from(arguments);
}


var opts = {};
onUiUpdate(function() {
    if (Object.keys(opts).length != 0) return;

    var json_elem = gradioApp().getElementById('settings_json');
    if (json_elem == null) return;

    var textarea = json_elem.querySelector('textarea');
    var jsdata = textarea.value;
    opts = JSON.parse(jsdata);

    executeCallbacks(optionsChangedCallbacks); /*global optionsChangedCallbacks*/

    Object.defineProperty(textarea, 'value', {
        set: function(newValue) {
            var valueProp = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
            var oldValue = valueProp.get.call(textarea);
            valueProp.set.call(textarea, newValue);

            if (oldValue != newValue) {
                opts = JSON.parse(textarea.value);
            }

            executeCallbacks(optionsChangedCallbacks);
        },
        get: function() {
            var valueProp = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
            return valueProp.get.call(textarea);
        }
    });

    json_elem.parentElement.style.display = "none";

    function registerTextarea(id, id_counter, id_button) {
        var prompt = gradioApp().getElementById(id);
        var counter = gradioApp().getElementById(id_counter);
        var textarea = gradioApp().querySelector("#" + id + " > label > textarea");

        if (counter.parentElement == prompt.parentElement) {
            return;
        }

        prompt.parentElement.insertBefore(counter, prompt);
        prompt.parentElement.style.position = "relative";

        promptTokecountUpdateFuncs[id] = function() {
            update_token_counter(id_button);
        };
        textarea.addEventListener("input", promptTokecountUpdateFuncs[id]);
    }

    registerTextarea('txt2img_prompt', 'txt2img_token_counter', 'txt2img_token_button');
    registerTextarea('txt2img_neg_prompt', 'txt2img_negative_token_counter', 'txt2img_negative_token_button');
    registerTextarea('img2img_prompt', 'img2img_token_counter', 'img2img_token_button');
    registerTextarea('img2img_neg_prompt', 'img2img_negative_token_counter', 'img2img_negative_token_button');

    var show_all_pages = gradioApp().getElementById('settings_show_all_pages');
    var settings_tabs = gradioApp().querySelector('#settings div');
    if (show_all_pages && settings_tabs) {
        settings_tabs.appendChild(show_all_pages);
        show_all_pages.onclick = function() {
            gradioApp().querySelectorAll('#settings > div').forEach(function(elem) {
                if (elem.id == "settings_tab_licenses") {
                    return;
                }

                elem.style.display = "block";
            });
        };
    }
});

onOptionsChanged(function() {
    var elem = gradioApp().getElementById('sd_checkpoint_hash');
    var sd_checkpoint_hash = opts.sd_checkpoint_hash || "";
    var shorthash = sd_checkpoint_hash.substring(0, 10);

    if (elem && elem.textContent != shorthash) {
        elem.textContent = shorthash;
        elem.title = sd_checkpoint_hash;
        elem.href = "https://google.com/search?q=" + sd_checkpoint_hash;
    }
});

let txt2img_textarea, img2img_textarea = undefined;
let wait_time = 800;
let token_timeouts = {};

function update_txt2img_tokens(...args) {
    update_token_counter("txt2img_token_button");
    if (args.length == 2) {
        return args[0];
    }
    return args;
}

function update_img2img_tokens(...args) {
    update_token_counter(
        "img2img_token_button"
    );
    if (args.length == 2) {
        return args[0];
    }
    return args;
}

function update_token_counter(button_id) {
    if (token_timeouts[button_id]) {
        clearTimeout(token_timeouts[button_id]);
    }
    token_timeouts[button_id] = setTimeout(() => gradioApp().getElementById(button_id)?.click(), wait_time);
}

function restart_reload() {
    document.body.innerHTML = '<h1 style="font-family:monospace;margin-top:20%;color:lightgray;text-align:center;">Reloading...</h1>';

    var requestPing = function() {
        requestGet("./internal/ping", {}, function(data) {
            location.reload();
        }, function() {
            setTimeout(requestPing, 500);
        });
    };

    setTimeout(requestPing, 2000);

    return [];
}

// Simulate an `input` DOM event for Gradio Textbox component. Needed after you edit its contents in javascript, otherwise your edits
// will only visible on web page and not sent to python.
function updateInput(target) {
    let e = new Event("input", {bubbles: true});
    Object.defineProperty(e, "target", {value: target});
    target.dispatchEvent(e);
}


var desiredCheckpointName = null;
function selectCheckpoint(name) {
    desiredCheckpointName = name;
    gradioApp().getElementById('change_checkpoint').click();
}

function currentImg2imgSourceResolution(w, h, scaleBy) {
    var img = gradioApp().querySelector('#mode_img2img > div[style="display: block;"] img');
    return img ? [img.naturalWidth, img.naturalHeight, scaleBy] : [0, 0, scaleBy];
}

function updateImg2imgResizeToTextAfterChangingImage() {
    // At the time this is called from gradio, the image has no yet been replaced.
    // There may be a better solution, but this is simple and straightforward so I'm going with it.

    setTimeout(function() {
        gradioApp().getElementById('img2img_update_resize_to').click();
    }, 500);

    return [];

}



function setRandomSeed(elem_id) {
    var input = gradioApp().querySelector("#" + elem_id + " input");
    if (!input) return [];

    input.value = "-1";
    updateInput(input);
    return [];
}

function switchWidthHeight(tabname) {
    var width = gradioApp().querySelector("#" + tabname + "_width input[type=number]");
    var height = gradioApp().querySelector("#" + tabname + "_height input[type=number]");
    if (!width || !height) return [];

    var tmp = width.value;
    width.value = height.value;
    height.value = tmp;

    updateInput(width);
    updateInput(height);
    return [];
}
