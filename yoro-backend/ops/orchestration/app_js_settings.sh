# shell script to make changes in app.js file 

# Remove development server urls 
sed -i '/.constant("SERVER", {/c\    .constant("SERVER2", {' /home/yoro/yoro_codebase/yoro-frontend/yolo/www/js/app.js 

# Add production server urls
sed -i '/.constant("SERVER1", {/c\    .constant("SERVER", {' /home/yoro/yoro_codebase/yoro-frontend/yolo/www/js/app.js 
