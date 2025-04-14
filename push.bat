@echo off
echo 正在推送代码到GitHub...
git add .
git commit -m "更新: %date% %time%"
git push
echo 推送完成！
pause