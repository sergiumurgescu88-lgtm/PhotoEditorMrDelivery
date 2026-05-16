#!/bin/bash
cd /root/mrdelivery
export PATH="/root/.bun/bin:$PATH"
bunx serve -s dist --port 3000
