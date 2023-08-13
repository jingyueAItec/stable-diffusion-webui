# Init Git Repositories

```shell
mkdir -p deployment/submodules && pushd deployment/submodules
git submodule add https://github.com/CompVis/taming-transformers.git taming-transformers
git submodule add https://github.com/Stability-AI/stablediffusion.git stable-diffusion-stability-ai
git submodule add https://github.com/sczhou/CodeFormer.git CodeFormer
git submodule add https://github.com/salesforce/BLIP.git BLIP
git submodule add https://github.com/crowsonkb/k-diffusion.git k-diffusion
git submodule add https://github.com/pharmapsychotic/clip-interrogator clip-interrogator
git submodule add https://github.com/Stability-AI/generative-models generative-models
git submodule add https://github.com/TencentARC/GFPGAN.git GFPGAN
git submodule add https://github.com/openai/CLIP.git CLIP
git submodule add https://github.com/mlfoundations/open_clip.git open_clip
git submodule add git@github.com:AbdBarho/stable-diffusion-webui-docker.git stable-diffusion-webui-docker
popd

pushd deployment/submodules
pushd taming-transformers && git reset --hard 24268930bf1dce879235a7fddd0b2355b84d7ea6 && popd
pushd stable-diffusion-stability-ai && git reset --hard 47b6b607fdd31875c9279cd2f4f16b92e4ea958e && popd
pushd CodeFormer && git reset --hard c5b4593074ba6214284d6acd5f1719b6c5d739af && popd
pushd BLIP && git reset --hard 48211a1594f1321b00f14c9f7a5b4813144b2fb9 && popd
pushd k-diffusion && git reset --hard c9fe758757e022f05ca5a53fa8fac28889e4f1cf && popd
pushd clip-interrogator && git reset --hard 2486589f24165c8e3b303f84e9dbbea318df83e8 && popd
pushd generative-models && git reset --hard 45c443b316737a4ab6e40413d7794a7f5657c19f && popd
pushd GFPGAN && git reset --hard 8d2447a2d918f8eba5a4a01463fd48e45126a379 && popd
pushd CLIP && git reset --hard d50d76daa670286dd6cacf3bcd80b5e4823fc8e1 && popd
pushd open_clip && git reset --hard bb6e834e9c70d9c27d0dc3ecedeebeaeb1ffad6b && popd
pushd stable-diffusion-webui-docker && git reset --hard def76291f808cb249f8cfe35d8424a16a6a4c2f7 && popd
popd
```
