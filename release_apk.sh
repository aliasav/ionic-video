# Builds release apk

# declaring variables
apk_folder=/home/aliasav/COD/yoro/yoro-frontend/yolo/platforms/android/build/outputs/apk/
release_key_folder=/home/aliasav/COD/yoro/yoro-frontend/yolo/

# change dir to yoro app folder
cd /home/aliasav/COD/yoro/yoro-frontend/yolo


tput setaf 2; echo "***************** Bulding release APK *****************"
tput sgr0;

# build release apk
cordova build --release android


tput setaf 2; echo "***************** Signing Released APK *****************"
echo "***************** You will be prompted for the passphrase (hint : bmjbx) *****************"
tput sgr0;

# sign apk in place
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $release_key_folder/my-release-key.keystore $apk_folder/android-release-unsigned.apk yoro


# remove existing apks
rm -f $apk_folder/yoro-release.apk
rm -f /home/aliasav/COD/yoro/yoro-release.apk

tput setaf 2; echo "***************** Optimising Released APK *****************"
tput sgr0;

# optimise apk
zipalign -v 4 $apk_folder/android-release-unsigned.apk $apk_folder/yoro-release.apk


# copy apk to yoro folder
cp $apk_folder/yoro-release.apk /home/aliasav/COD/yoro/yoro-release.apk

cd /home/aliasav/COD/yoro/

tput setaf 2; echo "***************** HERE YOU GO! *****************"
tput sgr0;
ls
