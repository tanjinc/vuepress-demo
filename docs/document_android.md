# SDK接入文档-Andorid

## 接入须知

* 开发者提供APP的应用名和包名，用于申请GameSdkID和域名，确保游戏的安全性。
* 【必选】穿山甲SDK，并在穿山甲后台申请广告ID。  
* 【可选】优量汇SDK，并在优量汇后台申请广告ID。。    
&&激励视频广告&&为必要广告，其余为可选项；如不需要某类广告展示，代码不设置广告ID即可。 

<font color=#FF0000 >
“激励视频广告”为必要广告，其余为可选项；如不需要某类广告展示，代码不设置广告ID即可。</br>
小游戏广告ID不能给APP其他广告场景使用，否则收入会混在一起。</br>
详细广告样式，使用场景，广告位ID如何申请等，请阅读《测试必读和广告说明.docx》
</font>  

## 2. 初始化

| 库名 | 用途 |
| ------------|------------|
| cmgame-sdk-***.aar | 小游戏核心文件 |
| libnative-gamesdk.so | 游戏安全验证 |
| x5fit-***.aar | 【可选】提高游戏在5.X的兼容性和强化游戏流畅度 |
| gdtfit-***.aar | 【可选】支持优量汇广告 |

### **2.1 版本支持**
* 安卓系统版本要求：小游戏SDK支持大于等于安卓5.0：    
  大于等于安卓5.0：   
    H5游戏需要系统Webview支持，低版本系统游戏支持差，所以最低支持版本为Android 5.0（API 21）；  

### **2.2 第三方库依赖**

``` groovy
dependencies {
    ...
    // 豹趣小游戏核心依赖aar
    implementation name: 'cmgame-sdk-ttxxx-2.x.x', ext: 'aar'

    // 【可选】如需游戏展示优量汇广告，需要带上x5fit.aar
    // 增加X5，可以提高在android5.0和5.1下的游戏体验，webview比默认的做了很多优化
    // 如果不需要使用x5，注释掉下面，并且删除对应的文件
    // x5版本：20190429_175122
    implementation name: 'x5fit-2.0.x', ext: 'aar'
    implementation files("${rootDir}/ExternalAAR/qq_x5.jar")  

    // 【可选】如需游戏展示优量汇广告，需要带上gdtfit.aar
    implementation name: 'gdtfit-2.x.x', ext: 'aar'
    ...
}
```
### 2.3 示例代码 
完整代码和参考demo工程
``` java
public class DemoApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        initCmGameSdk();
    }

    /**
     * 游戏SDK初始化
     */
    private void initCmGameSdk() {
        // 注意：如果有多个进程，请务必确保这个初始化逻辑只会在一个进程里运行
        final String adAppId = "5001121";   // 穿山甲appid

        TTAdSdk.init(this,
                new TTAdConfig.Builder()
                        .appId(adAppId)
                        .useTextureView(false) //使用TextureView控件播放视频,默认为SurfaceView,当有SurfaceView冲突的场景，可以使用TextureView
                        .appName("APP测试媒体")
                        .titleBarTheme(TTAdConstant.TITLE_BAR_THEME_DARK)
                        .allowShowNotify(true) //是否允许sdk展示通知栏提示
                        .allowShowPageWhenScreenLock(true) //是否在锁屏场景支持展示广告落地页
                        .debug(true) //测试阶段打开，可以通过日志排查问题，上线时去除该调用
                        .directDownloadNetworkType(TTAdConstant.NETWORK_STATE_WIFI, TTAdConstant.NETWORK_STATE_3G) //允许直接下载的网络状态集合
                        .supportMultiProcess(false) //是否支持多进程，true支持
                        .build());



        CmGameAppInfo cmGameAppInfo = new CmGameAppInfo();
        cmGameAppInfo.setAppId("demo");                             // GameSdkID，向我方申请
        cmGameAppInfo.setAppHost("https://xyx-sdk-svc.cmcm.com");   // 游戏host地址，向我方申请

        // 【设置穿山甲广告id】不需要展示广告，则不设置广告ID
        CmGameAppInfo.TTInfo ttInfo = new CmGameAppInfo.TTInfo();
        // 游戏内广告有如下6种；
        ttInfo.setGameLoad_EXADId("901121536"); // 游戏加载时，插屏广告1:1，模板渲染
        ttInfo.setRewardVideoId("901121593");   // 激励视频
        ttInfo.setFullVideoId("901121073");     // 全屏视频，插屏场景下展示
        ttInfo.setExpressInteractionId("901121133"); // 插屏广告，插屏场景下展示，模板渲染，2：3
        ttInfo.setExpressBannerId("901121159"); // Banner广告，模板渲染，尺寸：600*150，会导致游戏卡慢，暂时不用
        ttInfo.setGameEndExpressFeedAdId("901121253"); // 游戏退出弹框，信息流广告，模板渲染
        ttInfo.setGameListExpressFeedId("901121134"); // 游戏列表，信息流广告，模板渲染
        cmGameAppInfo.setTtInfo(ttInfo);

        // 【设置广点通广告id】需要支持广点通广告时，才需下面代码
        CmGameAppInfo.GDTAdInfo gdtAdInfo = new CmGameAppInfo.GDTAdInfo();
        gdtAdInfo.setAppId("1101152570");               // 广点通的APPID
        // 游戏内广告场景；
        gdtAdInfo.setRewardVideoId("5040942242835423"); // 激励视频
        gdtAdInfo.setBannerId("4080052898050840");  // banner广告
        gdtAdInfo.setGameLoadInterId("4080298282218338");//游戏加载中的插屏
        gdtAdInfo.setPlayGameInterId("4080298282218338");//游戏进行中关卡插屏
        gdtAdInfo.setGameListExpressFeedId("7030020348049331");//游戏列表的广点通广告

        cmGameAppInfo.setGdtAdInfo(gdtAdInfo);
        // 【设置广点通和穿山甲广告占比】
        // 概率设置规则如下：
        // 0： 全部使用穿山甲广告
        // 100： 全部采用广点通广告
        // 40：则是穿山甲广告命中概率是60%，广点通是40%，如果一方没广告，则用另一方补量。
        cmGameAppInfo.setRewardAdProbability(0);        // 默认值为0，全部采用穿山甲激励视频广告

        //游戏加载中的广告类型优先级
        GameLoadingAdProbability gameLoadingAdProbability = new GameLoadingAdProbability()
                .setTtInteractionProbability(30)
                .setTtNativeProbability(30)
                .setGdtInteractionProbability(40);

        cmGameAppInfo.setGameLoadingAdProbability(gameLoadingAdProbability);


        cmGameAppInfo.setGameListAdProbability(0); //游戏列表的广告展示优先级， 100表示全部是广点通，0表示全部穿山甲。
        cmGameAppInfo
                .setShowRewardChallenge(false)      //是否不显示挑战-福利栏
                .setShowSearch(false);              //是否不显示搜索栏
        CmGameSdk.initCmGameSdk(this, cmGameAppInfo, new com.cmcm.gamemoney_sdk.CmGameImageLoader());
    }
}

```


## 5. 可选功能
1. 调用单个游戏和自定义游戏中心；  
2. 游戏列表页点击回调，可用于媒体统计；     
3. 游戏结束，并获取单个游戏时长回调，可用于媒体统计，或结合媒体自身激励体系等；       
4. 设置游戏保持亮屏；  
5. 游戏界面里增加媒体自定义View，可用于媒体激励体系或自身产品功能；  
6. 游戏信息永久存储，可解决APP卸载重装后或清理app缓存后的游戏数据丢失；   
7. 游戏列表加载完成回调APP；  
8. 增加中重度充值游戏；   
9. 支持创建游戏快捷方式。  

### 5.1 调用单个游戏和自定义游戏中心  
调用单个游戏，可用于信息流，banner，点击后调起指定游戏。  
自定义游戏中心界面，媒体选择游戏组装自家游戏中心，或者集成到媒体自身已存在的游戏中心里。


#### 5.1.1  通过游戏ID，调起指定游戏  
``` java
void startH5Game(String gameId) 
```

#### 5.1.2  获取部分游戏列表信息   
``` java
void getGameInfoList(final IGetGameListCallback callback)

public interface IGetGameListCallback {
    void onSuccess(List<GameInfo> gameInfoList);
    void onFailed(Throwable throwable);
}
```

#### 5.1.3  获取最近玩游戏，6个   
``` java
void getLastPlayGameInfoList(final IGetLastPlayGameListCallback callback)

public interface IGetLastPlayGameListCallback {
    void onQueryFinished(List<GameInfo> gameInfoList);
}
```


### 5.2 游戏列表页点击回调 
提供游戏点击数据给APP统计或其他操作。
``` java
//设置回调：
CmGameSdk.setGameClickCallback(this)

//回调处理：
@Override
public void gameClickCallback(String gameName, String gameID) {

}
```

### **5.3 获取单个游戏时长回调**  
使用场景：用于APP数据统计游戏时长或激励场景，如：玩游戏多少秒，获取某某奖励。    
返回内容：游戏名、游戏时长，单位-秒。

``` java
//设置回调：
CmGameSdk.setGamePlayTimeCallback(this)

//回调处理：
@Override
public void gamePlayTimeCallback(String gameId, int playTimeInSeconds) {

}
```

时长统计方法：

   1. 计时开始：进入游戏界面(不是加载页)且第一个点击事件开始计时（包括点击或者滑动等动作）； 
   2. 计时结束：30秒内没点击游戏的操作，或退出游戏；  
   3. 触发回调：退出游戏-游戏右上角按钮或者物理返回键。   
   如：用户进入游戏后，首次点击游戏界面，开始计时，8秒后又点击一次，计8秒；5秒后，又有点击，累计记13秒。  
   此时，用户退出游戏，则把当前游戏名和13s，回调gamePlayTimeCallback。  

注：计时采用点击计算，比较严格，防止作弊，同时，激励视频广告播放时间，也不计入游戏时长。  


### **5.4 设置游戏保持亮屏**

默认和系统锁屏时间一致，如果想让用户游戏期间，一直亮屏，可调用如下方法   

``` java
CmGameSdk.setScreenOn(true);
```




### 5.5 自定义悬浮球View 
游戏界面支持自定义View，如激励场景下的计时悬浮窗。 

``` java
调用初始化方法：initMoveView()
默认关闭此功能。

```


右上角的计时器，效果如下：


![计时球](https://superman.cmcm.com/gamesdk/doc/flowball.png "计时球")

关键类：**CmGameTopView**，用于包装目标View

初始化方法：
```java
//rootView: 希望展示的View
//callback：点击事件回调
CmGameTopView(View rootView, CmViewClickCallback callback)

```

关键方法：
|方法 | 备注|
---|---
setLayoutParams | 设置View在整个游戏界面的布局，非必须；传参必须为FrameLayout.LayoutParams
setMoveEnable | View是否可滑动，默认是
setNeedShowAfterGameShow | 是否需要等到游戏加载成功再显示，默认是
CmGameSdk.INSTANCE.setMoveView | 设置目标CmGameTopView，请注意在模块结束后置空避免泄漏


view的效果可自定义，需要满足以下规则 ：

   1. 顶层View不能设定点击事件：内部方法会回调，可在回调中处理事件；
   2. 顶层View不能有一个以上可点击子View，否则会影响滑动事件，可以通过隐藏菜单实现多子View点击。


### 5.6 游戏进度信息永久存储
可解决APP卸载重装后或清理app缓存后的游戏数据丢失
有2种实现方案：    


#### 5.6.1 直接使用SDK提供的手机登陆功能，媒体方没开发工作量；   
实现原理：手机登陆后，手机账号和游客账号绑定，实现APP卸载后，重装数据不丢失。   

``` java
//功能默认开启，可使用如下方法来关闭：
cmGameAppInfo.setShowLogin(false);
```
![流程图](https://superman.cmcm.com/gamesdk/doc/logo.png "流程图")



#### 5.6.2 APP账号和游戏游客账号做绑定
实现原理：游戏中心返回游戏账号信息给APP（字符长度不超过1024个），APP账号和这些信息映射到自己服务器保存。   
支持返回账号信息，需告知豹趣商务开通账号同步功能。  

流程如下：  
1. APP启动时，通过APP的账号，去媒体服务器获取游戏的loginInfo，传入游戏中心；  
2. 如果参数loginInfo有值时，游戏中心将用该参数登陆游戏，并获取游戏信息，来实现数据同步；  
3. 如果参数loginInfo传空值时，会生成新的loginInfo，触发回调APP（token更新时也会触发回调）；  
4. APP收到回调后，把参数loginInfo和自己的账号做映射，并保存于自己服务器；  

![流程图](https://superman.cmcm.com/gamesdk/doc/account_flow_chart.png "流程图")

具体步骤如下：

1. 设置游戏账号信息回调：

```java
CmGameSdk.setGameAccountCallback(this)；
```

2. 回调处理，需要接入方保存游戏账号信息： 
<font color=#FF0000 >使用该功能需告知豹趣方，让其开通账号同步功能，才有数据返回。</font>  

``` java
@Override
public void onGameAccount(String loginInfo)
    // 不会每次都调用，只有初始化，或者token过期是才会调
}
```

3. 登录账号后，APP需要传入保存的loginInfo信息，调用如下接口：

``` java
CmGameSdk.restoreCmGameAccount(userInfo);
```

4.用户退出账号时，APP调用清除游戏账号信息的接口，清除游戏本地游戏数据：

``` java
CmGameSdk.clearCmGameAccount();
```

注：会出现这种情况，用户用游客账号玩游戏，后面发生APP账号登陆：
1） 如果APP账号在服务器没映射过游戏信息，就产生映射关系，游客账号的信息不会被覆盖；
2） 如果APP账号在服务器已有映射信息，则登陆成功后，之前的游客账号的信息，就会被覆盖掉。
该问题为常见问题，目前市面上的常规做法是加提示（SDK提供）如下：


![登录提醒](https://superman.cmcm.com/gamesdk/doc/account.png "登录提醒")



### 5.7 游戏列表加载完成回调APP  
部分媒体，游戏以tab方式的入口，需要有加载进度效果，故需要此事件回调。   
```
设置回调：
CmGameSdk.setGameListReadyCallback(this)

回调处理：
@Override
public void onGameListReady() {

}
```




### 5.9 创建游戏桌面快捷方式 
游戏快捷方式，可以提高用户进入游戏的便捷度，游戏退出后，返回APP的游戏中心，提高APP留存。    
快捷方式生成时机：   
玩游戏超过3分钟，在退出游戏时，提示创建桌面快捷方式。   

开启该功能需要如下2步操作：  
1. 媒体在APP工程的AndroidManifest.xml申明快捷方式的权限，拷贝Demo的AndroidManifest.xml的声明代码。     
2. 媒体通知豹趣运营人员开启功能。   

创建效果图：    
![快捷方式弹窗](https://superman.cmcm.com/gamesdk/doc/desktopicon.png "快捷方式弹窗")



## 6. 游戏列表智能推荐介绍 
需求：从媒体维度，做游戏智能推荐   
目标：提高游戏点击率和商业价值    
考核指标： 激励视频播放PV / 游戏图标可见   

### 原始数据 
- 游戏曝光位置   
- 游戏进入展示  
- 游戏广告播放  

其他细节：如果用户第一次进入游戏，没任何点击，则下一次进入有游戏顺序会更新  


## 7. 广告展示时机

总共有5类广告：

- 开屏广告：进入游戏时展示  (与广告平台的开屏不是同一个)；  
- 激励视频：所有游戏都有激励视频场景，激励视频播放期间点击返回键无效；  
- 全屏视频和插屏广告，部分游戏有插屏场景广告，可通过测试“冲撞迷阵”，每隔2-3关出现；   
- Banner广告：部分游戏有，如砖块消消消，每60s更新一次。

### 广告聚合比例分配
设置广点通和穿山甲广告占比
```java
CmGameAppInfo cmGameAppInfo = new CmGameAppInfo();

...
// 激励视频广告概率设置规则如下：
// 默认值为0，全部采用穿山甲激励视频广告
// 100：全部采用广点通广告
// 40：则是穿山甲广告命中概率是60%，广点通是40%，如果一方没广告，则用另一方补量。
cmGameAppInfo.setRewardAdProbability(0);        

//其他广告类型概率配置
GameLoadingAdProbability gameLoadingAdProbability = new GameLoadingAdProbability()
        .setTtInteractionProbability(30) //插屏广告
        .setTtNativeProbability(30)      //穿山甲原生视频广告
        .setGdtInteractionProbability(40);//广点通（优量汇）插屏广告

cmGameAppInfo.setGameLoadingAdProbability(gameLoadingAdProbability);
```

## 8.开发常见问题和自测要点 
如下要点必须自测一遍，否则影响收益：        
1. 游戏是否能正常进入；     
2. 广告是否能正常展示；   
3. 广告是否能下载；   
4. <font color=#FF0000 >**APP广告下载后，是否能安装成功。**</font>   
&emsp;&emsp;具体测试用例和各广告的说明，可查阅《广告说明.docx》  
5. 编译通过后运行时提示错误：
   <font color=#FF000>“androidRuntime java.lang.NoClassDefFounderror:Failed resolution of: Landroid/support/v7/util/DiffUtil$Callback”</font> 
   
   问题原因是合作方使用的recyclerview-v7版本低于24.2.0导致的，需要升级recyclerview-v7版本到24.2.0或以上版本，建议使用28.0.0版本


### 8.1 游戏是否能正常进入   
游戏无法进入问题排查：  
1. 必须确保APP包名和申请的GameSdkID，Host三者信息保持一致，并正确设置，否则无法进入游戏；  
2. 确认手机是否开了代理，如果有代理，则关闭掉，或者换一台手机在4G网络下试试；  

如果还有问题，请联系工作人员。  

### 8.2 广告是否能正常展示 
广告无法展示排查：  
1. 穿山甲广告，必须使用从穿山甲后台申请的appid，并且按穿山甲集成要求，正确的初始化穿山甲广告；  
2. 根据小游戏sdk穿山甲广告的申请截图，正确申请穿山甲的广告位，并通过小游戏sdk接口正确设置；  
3. 在IDE开发环境，输入tag为gamesdk_ ，电脑连接手机，操作整个问题流程可输出完整的日志，常见错误码：  
    <font color=#FF0000 >40025</font> ：穿山甲后台分配给APP的sdk版本和小游戏使用的sdk版本不一致，请下载穿山甲后台的sdk，并索要与之对应的小游戏sdk版本。   

### 8.3 APP广告下载后，是否能安装成功   
媒体接入时，出现此问题较多，严重影响收益。  

原因：没有按穿山甲sdk接入要求，设置TTFileProvider   
解决方案如下，来源于穿山甲集成文档：    

如果您的应用需要在Anroid7.0及以上环境运行，请在AndroidManifest中添加如下代码：

``` xml
<provider
    android:name="com.bytedance.sdk.openadsdk.TTFileProvider"
    android:authorities="${applicationId}.TTFileProvider"
    android:exported="false"
    android:grantUriPermissions="true">
   <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>
```

在```res/xml```目录下，新建一个xml文件```file_paths```，在该文件中添加如下代码：

``` xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-files-path name="external_files_path" path="Download" />
    <!--为了适配所有路径可以设置 path = "." -->
</paths>
```

为了适配下载和安装相关功能，在工程中引用的包 ```com.android.support:support-v4:24.2.0```
使用24.2.0以及以上版本。

### 8.4 GameView inflate一定要传Activity吗？
    一定要activity， 因为穿山甲的开屏广告要求传入activity

### 8.5 显示"暂无广告"
    通过gamesdk_ 过滤日志，查看广告问题，一般是广告id配置问题