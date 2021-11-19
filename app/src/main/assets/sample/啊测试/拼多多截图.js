"auto";


if (!requestScreenCapture()) {
    toast("请求截图失败");
    exit();
}

launchApp("拼多多");
console.clear();
console.hide();
console.show();
console.setPosition(0, 400);
//console.setSize(100,200);
sleep(3000);



console.info("开始执行!!!  宽高= " + device.width + ":" + device.height);

const URL = "http://10.6.95.108:8080/photo/upload";
var storage = storages.create("PDDScreenShot");
const KEY_GOODS_INDEX = "goodsIndex"; //商品序号
var skuListView;
var skuDepthList = []; //sku列表的深度值
var goodsList = [];
var goodsCode;
var goodsIndex = storage.get(KEY_GOODS_INDEX, 1);
var skuIndex = 1;

keywordlist();

// foreachList();

//swipelist();

console.info("运行结束🔚!!!");
toast("运行结束！！！");

exit();

function keywordlist() {
    //判断是否在搜索页
    var flagText = textContains("筛选").findOnce();
    if (flagText == null) {
        flagText = textContains("搜索").findOnce();
    }
    if (flagText == null) {
        var res = press(device.width / 2.0, 140, 80);
        if (!res) {
            res = click(device.width / 2.0, 140);
        }

        if (!res) {
            console.info("点击搜索框 失败!");
            return;
        }
        sleep(1000);
    } else {
        console.info("当前已在 搜索页!");
    }

    //var wordlist = ["奥利司他胶囊", "999感冒灵", "阿莫西林"];
    var wordlist = ["奥美拉挫", "盘尼西林"];

    for (var i = 0; i < wordlist.length; i++) {
        //滑动列表，显示搜索框
        gestures([500, [300, 1400],
            [300, 1800]
        ]);
        sleep(500);

        inputKeyword(wordlist[i]);
        //swipelist();
        foreachList();


    }
}



function inputKeyword(keyword) {
    //var backBtn = classNameContains("ImageView").findOnce();
    var backBtn = textContains("商品").findOnce();
    var res;
    if (backBtn != null) {
        var y = backBtn.bounds().centerY();
        console.info("输入框点击 y= " + y);
        res = click(device.width / 2.0, y);
    } else {
        res = click(device.width / 2.0, 200);
    }
    sleep(300);
    console.info("输入框点击 = " + res);
    if (res) {
        var et = classNameContains("EditText").findOnce();
        if (et != null) {
            res = et.setText(keyword);
            console.info("搜索框 填入关键词= " + res);
            sleep(500);
        }
    }
    var searchBtn = textContains("搜索").findOnce();
    if (searchBtn != null) {
        res = searchBtn.click();
        console.info("点击搜索 = " + res);
        sleep(2000);
    }


}


function arrayContains(array, value) {
    return goodsList.indexOf(value) > -1;
}

function foreachList() {

    while (true) {
        var canClick = 0;
        var clickedCount = 0;
        var goodsListView = classNameContains("RecyclerView").findOnce();
        if (goodsListView != null) {
            goodsListView.children().forEach(function (child) {
                if (child != null) {
                    if (child.clickable()) {
                        canClick++;
                        var key = '';
                        var tvTitle = child.findOne(id("com.xunmeng.pinduoduo:id/tv_title"));
                        var tvSale = child.findOne(textContains("已拼"));
                        if (tvTitle != null && tvSale != null) {
                            key = tvTitle.text() + "" + tvSale.text();
                        }
                        console.info("key = " + key);
                        if (key != '' && !arrayContains(goodsList, key)) {
                            goodsList.push(key);
                        } else {
                            clickedCount++;
                            console.info("已经点击过 ：" + key);
                            //跳过
                            return;
                        }
                        var res = child.click();
                        console.info("Item 点击 = " + res);
                        if (res) {
                            sleep(1000);

                            jumpToDetail();

                            // back();
                            // sleep(500);
                        }

                    } else {
                        // var tvTitle = child.findOne(id("com.xunmeng.pinduoduo:id/tv_title"));
                        // var noMore = textContains("没有更多").findOnce();
                    }
                }
            });


            //滑动列表
            var res = scrollDown();
            if (res) {
                sleep(600);
            } else {
                console.info("无法滑动，列表已到底！");

                var noMore = textContains("没有更多").findOnce();
                if (noMore != null) {
                    console.info("没有更多商品，列表已到底！");
                }
                break;
            }

            if (canClick == clickedCount) {
                console.info("已点击数量，一直不变，即认定无法滑动，列表已到底！");
                break;
            }
        }
    }
}

function swipelist() {
    for (var i = 1; i < 3; i++) {


        //点击进入商祥
        var res = press(200, device.height - 350, 80);
        if (!res) {
            res = click(200, device.height - 350);
        }
        sleep(1500);

        jumpToDetail();

        //滑动列表
        gestures([500, [300, 1400],
            [300, 500]
        ]);
    }
}

function jumpToDetail() {

    //检测是否是商祥页
    var flagText = textContains("发起拼单").findOnce();
    if (flagText == null) {
        flagText = textContains("去复诊开药").findOnce();
    }
    if (flagText == null) {
        console.info("判断不是商祥页，跳过!!!");
        back();
        sleep(500);
        return;
    }

    //更新截图编码
    goodsIndex++;
    storage.put(KEY_GOODS_INDEX, goodsIndex);

    goodsCode = goodsIndex;

    //点击主图，并截图
    var res = click(device.width - 100, 400);
    if (res) {
        sleep(600);
        var picName = goodsCode + "-主图";
        screenShot(picName);
        console.info("商品主图--截图成功");
        back();
        sleep(600);
    }


    //截取顶部信息图
    var picName = goodsCode + "-首屏";
    screenShot(picName);
    //console.info("商祥首屏--截图成功");

    var detailTextY = 0;
    while (true) {
        var detailText = textContains("商品详情").findOnce();
        if (detailText != null) {
            console.info("已滑动到  商品详情");
            if (detailText != null) {
                var bounds = detailText.bounds();
                detailTextY = bounds.centerY();
                console.info("找到商品详情,y= " + bounds.centerY());
                break;
            }

        }
        gestures([500, [300, device.height - 300],
            [300, 10]
        ]);
        sleep(500);
        console.info("执行一次循环----");
    }
    var infoBtn = textContains("查看全部").filter(function (v) {
        return v.bounds().centerY() > detailTextY;
    }).findOnce();

    if (infoBtn == null) {

        gestures([500, [300, device.height - 300],
            [300, 10]
        ]);
        sleep(500);

        infoBtn = textContains("查看全部").filter(function (v) {
            return v.bounds().centerY() > detailTextY;
        }).findOnce();
    }

    if (infoBtn != null) {
        var result = infoBtn.parent().click();
        console.info("找到查看全部，并点击= " + result);
        sleep(600);
        var picName = goodsCode + "-商品参数";
        screenShot(picName);
        back();
        sleep(500);
    } else {
        console.info("找不到，查看全部！，跳过---");
    }

    //var btn = textContains("发起拼单").findOnce();
    if (flagText != null) {
        var result = flagText.parent().click();
        sleep(500);
        console.info("找到发起拼单，并点击= " + result);

        console.info("找到商品属性页");

        skuListView = classNameContains("RecyclerView").findOnce();
        console.info("属性列表 =" + (skuListView == null));

        skuIndex = 1;
        findViewTree(skuListView, 0);

        console.info("列表点击执行完了");
        back();
        sleep(500);
    } else {
        console.info("没有找到，发起拼单或 去复诊开业");
    }

    back();
    sleep(500);

    //当一个商品执行完，上传文件夹下图片
    var dir = "/sdcard/1拼多多截图/商品" + goodsIndex + "/";
    uploadImageDir(dir);
}

function getView() {
    var view = skuListView;
    skuDepthList.forEach(function (index) {
        view = view.child(index);
    });
    return view;

}

function findViewTree(view, depth) {
    if (view == null) {
        //console.info("findViewTree  view == null");
        return;
    }

    var count = view.childCount()
    if (count > 0) {
        for (var i = 0; i < count; i++) {
            skuDepthList.push(i);
            var child = getView();
            findViewTree(child, 1 + depth);
            skuDepthList.pop();
        }

    } else {
        //console.info("没有子view= " + view.className());

        if (!view.clickable() || view.className().indexOf("ImageView") >= 0) {
            return;
        }
        if (view.className().indexOf("TextView") >= 0) {
            console.info("textview  内容= " + view.text());
        }
        //console.info("可点击" + level);
        if (!view.selected()) {
            sleep(300);
            view.click(); //界面改变之后之前获取的对象都为null
        }
        // console.info("点击完成" );
        sleep(500);
        skuIndex++;
        var picName = goodsCode + "-商品属性-" + skuIndex;
        screenShot(picName);

    }
}



function screenShot(picCode) {
    console.info("截图-------" + picCode);
    var img = captureScreen();
    var dir = "/sdcard/1拼多多截图/商品" + goodsIndex + "/";
    files.ensureDir(dir)

    var path = dir + "截图" + picCode + ".png";
    images.saveImage(img, path);
    toast("截图成功");
    sleep(500);


    // uploadImage(path)
}


function uploadImageDir(dir) {
    threads.start(function () {
        console.info("开始上传图片");
        if (files.exists(dir) && files.isDir(dir) && !files.isEmptyDir(dir)) {

            var images = files.listDir(dir, function (name) {
                return name.endsWith(".png") && files.isFile(files.join(dir, name));
            });

            var pathArr = [];
            images.forEach(function (name) {
                pathArr.push(open(files.join(dir, name)))
            });

            var respone = http.postMultipart(URL, {
                "file": pathArr
            });
            var res = respone.body.string();
            log(res);
            if ("success" == res) { //上传成功 ，删除文件夹及内容
                console.info(pathArr + " 上传成功");
                var isDel = files.removeDir(dir)
                console.info("删除成功" + isDel);
            } else {
                console.info(dir + " 上传失败");
            }
        } else {
            console.info("文件不存在或为空");
        }
    });
}

function uploadImage(path) {
    threads.start(function () {
        console.info("开始上传图片");
        if (files.exists(path) && files.isFile(path)) {
            var respone = http.postMultipart(URL, {
                "file": open(path)
            });
            var res = respone.body.string();
            log(res);
            if ("success" == res) { //上传成功 ，删除文件夹及内容
                console.info(path + " 上传成功");
                var isDel = files.remove(path)
                console.info("删除成功" + isDel);
            } else {
                console.info(dir + " 上传失败");
            }
        } else {
            console.info("文件不存在或为空");
        }
    });
}

function clickView(view) {

    if (view == null || !view.clickable() || view.className().indexOf("ImageView") >= 0) {
        return;
    }

    var res = view.click()
    if (view.className().indexOf("TextView") >= 0) {
        console.info("点击了 = " + view.text() + " " + res);
    }
}

//  //找出动态列表
//    var list = id("com.xunmeng.pinduoduo:id/tv_title").findOne();
//    //遍历动态
//    list.children().forEach(function(child) {
//        var t1 = child.text();
//        toast("内容+" + t1);
//    });