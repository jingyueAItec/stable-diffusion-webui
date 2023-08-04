#!/bin/bash
source .venv/bin/activate
ps aux | grep webui.py| grep -v "grep" | awk -F' ' '{print $2}' | xargs kill -9
nohup python webui.py --listen --xformers --no-half-vae --enable-insecure-extension-access --api &
tail -f nohup.out
