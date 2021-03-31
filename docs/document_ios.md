# SDK接入文档-iOS


## SDK接入准备须知、
---
* 申请豹趣appid和域名
* 确认DAU是否超过百万量级，如果超过百万，我们需要1天时间申请服务器资源和测试；
* 提供：
  * BUAd（头条广告平台）申请的 appid，
  * 激励视频广告 id
  * banner 广告 id（banner尺寸600*90
  * 插屏广告 id
  * 全屏广告 id
  所有广告都是原生模板类型；

### 1.2 权限设置

* App应用Info.plist增加以下配置支持HTTPS访问

``` xml
<key>NSAppTransportSecurity</key>
<dict>
	<key>NSAllowsArbitraryLoads</key>
	<true/>
</dict>
```

* 注意：不可以包含NSAllowsArbitraryLoadsInWebContent，否则看不到广告内容

## 2. Framework接入
---
### 3.1 引入依赖库
podfile
``` 
#SDK版本 >=3.4.0.0
pod 'Ads-CN', '3.4.2.3'
pod 'SDWebImage', '5.10.4'
```

* BUAd（当前小游戏 sdk 适配版本：3.4.2.3(高版本如果没有接口变动，也支持)，支持 iOS 14）参考：[穿山甲接入文档](https://www.pangle.cn/help/doc/5fbdb5e11ee5c2001d3f0c75)

## 3.2 导入CMGameSDK流程

1. Add CMGameSDK.framework To 项目根目录（optional)
2. Build Phases > Link Binary with Libraries > 增加:CMGameSDK.framework
3. Build Phases > Copy Bundle Resources > 增加:CMGameBundle.bundle



## 3.3 加入以下代码支持游戏界面展示

``` objc
#import <CMGameSDK/CMGameSDK.h>

@interface ViewController () <CMGameDelegate>

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.

    self.view.backgroundColor = [UIColor whiteColor];

    CMGameAppInfo *appInfo = [CMGameAppInfo alloc];            //配置APP信息
    appInfo.appId = @"demo";                              //豹趣申请的appId
    appInfo.baseUrl = @"https://xyx-sdk-svc.beike.cn";    //豹趣申请的apphost，注：不能以/结尾
    [CMGameSDK setAppInfo:appInfo];

    BUInfo *buInfo = [BUInfo alloc];                    //配置BUAd，如果不希望某种广告展示，不填充广告id即可
    buInfo.appId = @"5000546";                          //BU申请的appId
    buInfo.bannerSlotId = @"900546269";                 //BU申请的原生模板渲染类型bannerId，banner尺寸600*90
    buInfo.rewardedVideoSlotId = @"900546566";          //BU申请的原生模板渲染类型（竖屏）激励视频Id
    buInfo.interstitialSlotId = @"900546270";           //BU申请的原生模板渲染类型插屏Id
    buInfo.fullscreenVideoSlotId = @"900546551";        //BU申请的原生模板渲染类型（竖屏）全屏广告Id
    [CMGameSDK setBUInfo:buInfo];

    //设置回调接口，必须在下面的 init() 方法前调用，否则会导致 didCMGameListReady() 方法不回调
    //注：内部使用弱引用来持有 delegate 对象，不会有内存泄漏风险
    [CMGameSDK setDelegate:self];

    // 初始化SDK，加载游戏列表，并异步加载云端最新的游戏列表
    // 为避免打印太多日志，在正式版本时参数建议为 false
    [CMGameSDK init:false];

    //SDK 内部需要外部提供 vc 来展示游戏的 WebView
    //注：内部使用弱引用来持有 controller 对象，不会有内存泄漏风险
    [CMGameSDK putPresentViewController:self];

    CGFloat width = CGRectGetWidth(self.view.frame);
    CGFloat height = CGRectGetHeight(self.view.frame);
    int horizontalEdgeSpacing = 15;
    int verticalEdgeSpacing = 5;
    CGRect statusRect = [[UIApplication sharedApplication] statusBarFrame];
    CGRect navRect = self.navigationController.navigationBar.frame;
    CGFloat top = statusRect.size.height + navRect.size.height;
    CGRect rect = CGRectMake(horizontalEdgeSpacing, top + verticalEdgeSpacing,
            width - horizontalEdgeSpacing * 2, height - top - verticalEdgeSpacing * 2);
    UIView* view = [CMGameSDK getGameClassifyView:rect];
    [self.view addSubview:view];

    // 申请用户鉴权信息，用于存储游戏内部的用户数据。
    // 为了避免豹趣服务端产生大量无用的数据，请确保这个方法在小游戏列表展示后才调用
    // 注：由于这个方法是阻塞的，为了避免影响界面展示，建议异步执行
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        [CMGameSDK initCmGameAccount];
    });
}

/**
 * 利用外部提供的 ImageLoader 实现加载游戏封面图片。
 * 由于大部分应用都集成了类似 SDWebImage 这样的异步加载网络图片的类库，SDK 内不便集成，所以延迟到外部来实现。
 * SDK 对这个方法使用的地方：
 * 一、使用 SDK 提供的 [CMGameSDK getGameScrollView:frame] 来获取游戏列表布局，会调用这个方法来加载游戏封面图片。
 * 二、调用 SDK 提供的 [CMGameSDK playGame:gameId] 会使用这个方法来加载游戏封面图片用于游戏 loading 页面。
 * 细节可查看 Demo 里的实现逻辑。
 */
- (void)loadImage:(UIImageView *)imgView url:(NSString *)url placeHolder:(UIImage *)placeHolder {
    NSURL *imageUrl = [NSURL URLWithString:url];
    [imgView sd_setImageWithURL:imageUrl placeholderImage:placeHolder];
}

//点击游戏列表中的游戏时回调返回gameId
- (void)didCMGameClicked:(NSString*)gameId {
    NSLog(@"didGameClicked => gameId:%@", gameId);
}

// 退出游戏时回调返回 gameId
- (void)didCMGameExit:(NSString*)gameId {
    NSLog(@"didCMGameExit => gameId:%@", gameId);
}

//游戏列表准备好/更新时回调
- (void)didCMGameListReady:(NSUInteger)gameCount {
    NSLog(@"didCMGameListReady => gameCount:%lu", (unsigned long)gameCount);

    // 可以在此处实现更新游戏列表的控件
    NSArray * gameList = CMGameSDK.getGameList;
    for (CMGameInfo* info in gameList) {
        NSLog(@"didCMGameListReady => gameId:%@ gameName:%@", info.gameId, info.gameName);
    }

    //获得最近玩的游戏列表（只返回最近玩的6个游戏）
    NSArray * gameList = CMGameSDK.getLastPlayGameList;
    NSLog(@"LastPlayGameList=> gameList:%lu", gameList.count);
    for (CMGameInfo* info in gameList) {
        NSLog(@"LastPlayGameList=> gameId:%@ gameName:%@", info.gameId, info.gameName);
    }
}

// 通知游戏加载结果，可用于接入方自行实现游戏加载界面时获得关闭加载界面的时机或者展示加载失败页面的时机
- (void)didCMGameLoadFinish:(NSString *)gameId :(bool)isSuccess {
    NSLog(@"didCMGameLoadFinish => [%@] result: %d", gameId, isSuccess);
}

// 在游戏数据有改变时通知外部，gameData 是游戏的关卡统计数据，json 格式，不同游戏的数据格式不同，
//   如快来连方块、航海传奇的数据：{"level":3}
//   如开心钓钓乐的数据：{"level":4,"depth":60,"strength":6}
- (void)didCMGameDataChanged:(NSString*)gameId :(NSString *)gameData {
    NSLog(@"didCMGameDataChanged => gameId:%@ datas: %@", gameId, gameData);
}

@end

```

## 4.SDK API说明

### 4.1 设置游戏信息

设置游戏信息，需要向猎豹申请

``` objc
@interface CMGameAppInfo : NSObject

@property(copy, nonatomic) NSString *appId;          //豹趣申请的appId,与gameToken有关
@property(copy, nonatomic) NSString *baseUrl;        //豹趣申请的apphost,与gameToken有关

@end

+ (void)setAppInfo:(CMGameAppInfo *)info;
```


### 4.2 配置头条广告

* 配置头条广告，需要向头条申请各位置的广告ID

``` objc
@interface BUInfo : NSObject

@property(copy, nonatomic) NSString *appId;                      //BUAd申请的appId
@property(copy, nonatomic) NSString *rewardedVideoSlotId;        //BUAd申请的激励视频Id
@property(copy, nonatomic) NSString *bannerSlotId;               //BUAd申请的bannerId，banner尺寸600*90
@property(copy, nonatomic) NSString *interstitialSlotId;         //BUAd申请的插屏Id

@end

+ (void)setBUInfo:(BUInfo *)info;
```


### 4.3 初始化SDK
初始化SDK

``` objc
/**
 * isDebug:是否调试模式（打印日志，上报日志到测试服务器），正式发版请设置true
 */
+ (void)init:(bool)isDebug;
```



### 4.4 初始化豹趣 SDK 用户鉴权信息

* 用于存储游戏内部的用户数据

``` objc
/**
 * 为了避免豹趣服务端产生大量无用的数据，请确保这个方法在小游戏列表展示后才调用
 * 注：由于这个方法是阻塞的，为了避免影响界面展示，建议异步执行
 */
+ (void)initCmGameAccount;
```



### 4.5 获取游戏滚动列表（带分类）

获取游戏滚动列表界面，常用在单独Tab页面

``` objc
/**
 @frame 屏幕矩形信息
 @return 返回UIScrollView
 */
+ (UIScrollView*)getGameClassifyView:(CGRect)frame;
```

### 4.6 游戏界面相关

* 打开游戏界面，常用在自定义卡片点击后调用
* 游戏标识符由猎豹提供，可从 getGameList() 接口中获得

``` objc
/**
 @gameId 游戏标识符
 */
+ (CMGameSDKStatusCode)playGame:(NSString*)gameId;

//返回的状态码：
CMGameSDKStatusCodeSuccess // 成功

CMGameSDKStatusCodeGameNotFound // 找不到该游戏。可能是因为接入方自行维护一份游戏列表，与 SDK 里的游戏列表有差异，建议先调用 getGameInfo() 获取游戏实体，如果获取不到，不要调用 playGame() 方法

CMGameSDKStatusCodeAuthDeny // 授权失败，可能是客户端的 bundle identifier 未在豹趣服务端登记，或者是网络不通导致请求服务端失败了
```

退出游戏

``` objc
/**
 退出游戏界面，用于接入方自行实现 loading 界面时，在退出 loading 界面后通知游戏停止加载。
 @gameId 游戏标识符
 @return 是否成功退出（在游戏实例存在，并且 gameId 匹配时返回 YES）
 */
+ (bool)quitGame:(NSString *)gameId;
```


### 4.7 设置游戏回调

设置游戏代理/回调（此接口非必须实现，请根据需要使用）

``` objc
@protocol CMGameDelegate <NSObject>
@optional
//游戏列表更新时回调并返回游戏个数
- (void)didCMGameListReady:(NSUInteger)gameCount;

//点击游戏列表中的游戏时回调返回gameId
- (void)didCMGameClicked:(NSString*)gameId; 
@end

// 退出游戏时回调返回 gameId，这个接口可配合 didCMGameClicked 来统计用户的玩游戏时长
- (void)didCMGameExit:(NSString*)gameId;

// 通知游戏加载结果，可用于接入方自行实现游戏加载界面时获得关闭加载界面的时机或者展示加载失败页面的时机
- (void)didCMGameLoadFinish:(NSString *)gameId :(bool)isSuccess;

+ (void)setDelegate:(id<CMGameDelegate>)delegate;
```


### 4.8 获取 SDK 当前的游戏列表
``` objc
+ (NSArray *)getGameList;
```

游戏列表暴露的游戏字段包括这些：
``` objc
@property(copy, nonatomic) NSString *gameName; // 游戏名称，如：开心钓钓乐
@property(copy, nonatomic) NSString *gameId;   // 游戏唯一标识，如：kaixindiaodiaole
@property(copy, nonatomic) NSString *gameUrl;
@property(copy, nonatomic) NSString *iconUrl;  // 长方形游戏 icon，尺寸为 208x268
@property(copy, nonatomic) NSString *iconUrlSquare; // 正方形游戏 icon，尺寸为 200x200
@property(nonatomic) NSInteger playerNum;
```


### 4.9 从 SDK 当前的游戏列表取得某游戏
``` objc
+ (CMGameInfo *)getGameInfo:(NSString *)gameId;
```

### 4.10 获取 SDK 最近常玩游戏列表
``` objc
+ (NSArray *)getLastPlayGameList;
```

### 4.11 设置激励视频广告回调

设置激励视频广告回调（此接口非必须实现，请根据需要使用）

``` objc
@protocol RewardVideoDelegate <NSObject>
@optional
//激励视频展示
- (void)onRewardVideoShow;

//激励视频点击
- (void)onRewardVideoClick;

//激励视频播放结束
- (void)onRewardVideoPlayFinish:(bool)isReward;

//激励视频关闭
- (void)onRewardVideoClose;
@end

/**
 设置激励视频回调代理
 @delegate
 */
+ (void)setRewardVideoDelegate:(id <RewardVideoDelegate>)delegate;
```

### 4.12 设置全屏视频广告回调

设置全屏视频广告回调（此接口非必须实现，请根据需要使用）

``` objc
@protocol FullScreenVideoDelegate <NSObject>
@optional
//全屏视频展示
- (void)onFullScreenVideoShow;

//全屏视频关闭
- (void)onFullScreenVideoClose;
@end

/**
 设置全屏视频回调代理
 @delegate
 */
+ (void)setFullScreenVideoDelegate:(id <FullScreenVideoDelegate>)delegate;
```

### 获取当前 SDK 的版本号
``` objc
+ (NSString*)getVersion;
```

