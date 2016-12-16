cd controller
webpack
cd ..
cd screen
webpack
cd ..

mv ./controller/dist/index.html ./controller.html
mv ./screen/dist/index.html ./screen.html
cp ./controller/dist/* .
mv ./screen/dist/* .
git add .
git commit -m "Update"
git push
