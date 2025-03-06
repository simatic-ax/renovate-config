#!/bin/bash
set -ex
apt-get install --assume-yes --no-install-recommends \
        libtinfo6 \
        git
mkdir apax-dep
curl -sL https://deb.nodesource.com/setup_14.x 
apt install npm
npm config set prefix "~/.local/"
mkdir -p ~/.local/bin
echo 'export PATH=~/.local/bin/:$PATH' >>~/.bashrc
npm init -y
curl -f -H "Authorization: bearer $RENOVATE_APAX_TOKEN" \
        https://api.simatic-ax.siemens.io/apax/login?format=npmrc > .npmrc \
npm add @ax/apax-signed
npm install
cd node_modules/@ax/apax-signed
ls -al
chmod 777 .
echo "-----BEGIN PUBLIC KEY-----" \
>public.pem
sudo echo "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4m2LqXil8zyn+Z9v0J93" \
>>public.pem
echo "03hNjjrw6JMKvj0skNJvSaNPq1cYwq1Q/cu86Ny/Wl+lJT+Nzl32oKcgPuU+eY1Z" \
>>public.pem
echo "VTm9ZYPmIuoO+WPEsW5v1q8u7LURJt5jMxyfVQLXakUzkrjdQY+8/fO77R/s7ndi" \
>>public.pem
echo "qOXvoDw4SC8RAcbFVoske7R9L8nr8+lAjyOAs7fcWEOAkXaFF3BNIddxAGtAjXr5" \
>>public.pem
echo "5y+ecHh0wom+diN3RdSDk5TqKl9F8lThAqd8LjFxRcjaeaKftruTB9yd+ppN/4wl" \
>>public.pem
echo "avwaTQ/7eYHbvNV5aYeELUzxFykhsqKlIeo93y/ncnU0xS7W6ccCvNJ74kRfRtJY" \
>>public.pem
echo "WwIDAQAB" \
>>public.pem
echo "-----END PUBLIC KEY-----" \
>>public.pem
npm install --global ax-apax-*.tgz --verbose
apax --version
#runuser -u ubuntu renovate