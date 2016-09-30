/**
 *
 * @author
 *
 */
var GameView = (function (_super) {
    __extends(GameView, _super);
    function GameView() {
        _super.apply(this, arguments);
    }
    var d = __define,c=GameView,p=c.prototype;
    /**
    * 创建场景界面
    * Create scene interface
    */
    p.createScene = function () {
        //初始化游戏界面
        this.count = 0;
        this.rowNum = 8;
        this.colNum = 8;
        this.spaceX = 50;
        this.spaceY = 50;
        this.time = 60;
        this.gameOverText = new egret.TextField();
        this.gameOverText.size = 30;
        this.gameOverText.y = 303;
        this.gameOverText.width = 480;
        this.gameOverText.height = 120;
        this.gameOverText.text = "GAME OVER";
        this.gameOverText.textAlign = "center";
        this.gameOverText.touchEnabled = true;
        this.gameOverText.addEventListener(egret.TouchEvent.TOUCH_TAP, this.newGame, this);
        this.addChild(this.gameOverText);
        //创建头部
        this.clock = new egret.Bitmap();
        this.clock.texture = RES.getRes("clock");
        this.clock.x = 42;
        this.clock.y = 31;
        this.bar_1 = new egret.Bitmap();
        this.bar_1.texture = RES.getRes("bar_1");
        this.bar_1.x = 117;
        this.bar_1.y = 36;
        this.bar_2 = new egret.Bitmap();
        this.bar_2.texture = RES.getRes("bar_2");
        this.bar_2.x = 117;
        this.bar_2.y = 36;
        this.bar_msk = new egret.Rectangle(0, 0, this.bar_2.width, this.bar_2.height);
        this.bar_msk.x = 117;
        this.bar_msk.y = 36;
        this.levelText = new egret.TextField();
        this.levelText.width = 150;
        this.levelText.x = 39;
        this.levelText.y = 113;
        this.levelText.size = 24;
        this.scoreText = new egret.TextField();
        this.scoreText.width = 150;
        this.scoreText.x = 305;
        this.scoreText.y = 113;
        this.scoreText.size = 24;
        this.gameBg = new egret.Bitmap();
        this.gameBg.texture = RES.getRes("bgImage");
        this.addChild(this.gameBg);
        //创建游戏容器
        this.starRES_array = new Array(RES.getRes("star_1"), RES.getRes("star_2"), RES.getRes("star_3"), RES.getRes("star_4"), RES.getRes("star_5"));
        this.gameBody = new egret.DisplayObjectContainer();
        this.gameBody.x = 0;
        this.gameBody.y = 350;
        this.newGame();
        this.addChild(this.clock);
        this.addChild(this.bar_1);
        this.mybar = new egret.DisplayObjectContainer();
        this.mybar.mask = this.bar_msk;
        this.mybar.addChild(this.bar_2);
        this.addChild(this.mybar);
        this.addChild(this.levelText);
        this.addChild(this.scoreText);
        this.addChild(this.gameBody);
    };
    p.newGame = function () {
        this.removeChild(this.gameOverText);
        this.level = 1;
        this.source = 0;
        this.isDone = false;
        this.hasSame = false;
        this.cColNum = 0;
        this.cRowNum = 0;
        this.check_array = new Array();
        this.same_array = new Array();
        this.source = 0;
        this.scoreText.text = String(this.source);
        this.bar_2.x = 117;
        this.levelText.text = "关卡：" + this.level;
        this.scoreText.text = "分数：" + this.source;
        this.resetTime();
        this.creatStar();
    };
    p.nextLevel = function () {
        this.level++;
        this.levelText.text = "关卡：" + this.level;
        this.creatStar();
    };
    p.gameOver = function () {
        this.addChild(this.gameOverText);
        clearTimeout(this.newGameId);
        clearTimeout(this.tid);
        this.finishGame();
    };
    p.creatStar = function () {
        egret.log(document.body.clientWidth);
        //创建星星
        this.star_array = new Array();
        var temp_star;
        var num;
        for (var i = 0; i < this.colNum; i++) {
            this.star_array[i] = new Array();
            for (var j = 0; j < this.rowNum; j++) {
                num = Math.floor(Math.random() * this.starRES_array.length);
                temp_star = new egret.Bitmap(this.starRES_array[num]);
                this.star_array[i][j] = { "star": temp_star, "num": num, "colNum": i, "rowNum": j };
                //temp_star.anchorX = 0.5;
                //temp_star.anchorY = 0.5;
                temp_star.x = j * this.spaceX; //+ temp_star.width / 2;
                temp_star.y = i * this.spaceY + temp_star.height / 2 - 800;
                this.gameBody.addChild(temp_star);
                temp_star.touchEnabled = true;
                temp_star.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandle, this);
                egret.Tween.get(temp_star).wait((this.colNum - i) * (this.rowNum * 5) + 2 * j).to({ y: i * this.spaceY + temp_star.height / 2 }, 600);
            }
        }
    };
    p.tapHandle = function (e) {
        var temp_star;
        var i;
        var j;
        for (i = 0; i < this.colNum; i++) {
            for (j = 0; j < this.rowNum; j++) {
                if (this.star_array[i][j]) {
                    if (this.star_array[i][j].star == e.target) {
                        this.cColNum = i;
                        this.cRowNum = j;
                        break;
                    }
                }
            }
        }
        this.check_array = new Array();
        this.same_array = new Array();
        this.checkSide(this.cColNum, this.cRowNum); //检测相邻相同颜色的星星
        this.resetStar(); //重置星星
        this.checkDone(); //检测是否完成
    };
    p.resetTime = function () {
        this.bar_msk.width = this.bar_2.width;
        this.ctime = this.time;
        this.resumetTime();
    };
    p.resumetTime = function () {
        clearTimeout(this.tid);
        this.tid = setTimeout(this.timeHandler.bind(this), 1000);
    };
    p.timeHandler = function (evt) {
        this.ctime--;
        if (this.ctime == 0) {
            clearTimeout(this.tid);
            this.gameOver();
        }
        else {
            clearTimeout(this.tid);
            this.tid = setTimeout(this.timeHandler.bind(this), 1000);
        }
        this.bar_msk.width = this.bar_2.width * this.ctime / this.time;
    };
    //========================================================================================
    //检测相邻相同颜色的星星
    p.checkSide = function (_colNum, _rowNum) {
        this.checkPiece(_colNum, _rowNum, "left");
        this.checkPiece(_colNum, _rowNum, "right");
        this.checkPiece(_colNum, _rowNum, "up");
        this.checkPiece(_colNum, _rowNum, "down");
    };
    //检测是否完成关卡
    p.checkDone = function () {
        this.hasSame = false;
        var i;
        var j;
        for (i = 0; i < this.colNum; i++) {
            this.check_array = new Array();
            this.same_array = new Array();
            for (j = 0; j < this.rowNum; j++) {
                if (this.star_array[i][j]) {
                    this.cColNum = i;
                    this.cRowNum = j;
                    this.checkPiece(i, j, "left");
                    if (!this.hasSame) {
                        this.checkPiece(i, j, "right");
                    }
                    if (!this.hasSame) {
                        this.checkPiece(i, j, "up");
                    }
                    if (!this.hasSame) {
                        this.checkPiece(i, j, "down");
                    }
                }
                if (this.hasSame) {
                    break;
                }
            }
            if (this.hasSame) {
                break;
            }
        }
        if (!this.hasSame) {
            this.isDone = true;
            console.log("Done");
            this.finishGame();
            this.newGameId = setTimeout(this.nextLevel.bind(this), this.count * 100 + 700);
        }
    };
    p.checkPiece = function (_colNum, _rowNum, _type) {
        var tcol = _colNum;
        var trow = _rowNum;
        if (_type == "left") {
            if (_rowNum - 1 >= 0) {
                trow = _rowNum - 1;
            }
            else {
                trow = -1;
            }
        }
        else if (_type == "right") {
            if (_rowNum + 1 < this.rowNum) {
                trow = _rowNum + 1;
            }
            else {
                trow = -1;
            }
        }
        else if (_type == "up") {
            if (_colNum - 1 >= 0) {
                tcol = _colNum - 1;
            }
            else {
                tcol = -1;
            }
        }
        else if (_type == "down") {
            if (_colNum + 1 < this.colNum) {
                tcol = _colNum + 1;
            }
            else {
                tcol = -1;
            }
        }
        else {
            tcol = -1;
            trow = -1;
        }
        if (this.star_array[tcol]) {
            if (this.star_array[tcol][trow]) {
                if (this.check_array[tcol] == undefined) {
                    this.check_array[tcol] = new Array();
                }
                if (this.check_array[tcol][trow] == undefined) {
                    this.check_array[tcol][trow] = this.star_array[tcol][trow];
                    var cnum = this.star_array[_colNum][_rowNum].num;
                    if (cnum == this.star_array[tcol][trow].num) {
                        this.hasSame = true;
                        if (this.same_array[tcol] == undefined) {
                            this.same_array[tcol] = new Array();
                        }
                        this.same_array[tcol][trow] = this.star_array[tcol][trow];
                        this.checkSide(tcol, trow);
                    }
                }
            }
        }
    };
    //========================================================================================
    //重置色块位置
    //消失色块
    p.resetStar = function () {
        this.fadeOut();
        this.sortStar();
    };
    p.fadeOut = function () {
        var temp_star;
        var i;
        var j;
        var count = 0;
        for (i = 0; i < this.colNum; i++) {
            for (j = 0; j < this.rowNum; j++) {
                if (this.same_array[i]) {
                    if (this.same_array[i][j]) {
                        temp_star = this.same_array[i][j].star;
                        temp_star.touchEnabled = false;
                        temp_star.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandle, this);
                        this.star_array[i][j] = undefined;
                        egret.Tween.get(temp_star).to({ scaleX: 0.1, scaleY: 0.1, alpha: 0 }, 200, egret.Ease.circOut).call(this.funcComplete, this, [temp_star]);
                        count++;
                    }
                }
            }
        }
        this.source += this.getSource(count);
        this.scoreText.text = "分数：" + this.source;
    };
    p.funcComplete = function (_obj) {
        //消失后移除
        this.gameBody.removeChild(_obj);
    };
    //重排色块
    p.sortStar = function () {
        //检测竖排 重排数组
        var temp_star;
        var starRow_array = new Array();
        var mcY;
        var i;
        var j;
        for (i = this.rowNum - 1; i >= 0; i--) {
            starRow_array = new Array();
            for (j = this.colNum - 1; j >= 0; j--) {
                if (this.star_array[j][i] != undefined) {
                    starRow_array.push(this.star_array[j][i]);
                }
            }
            for (j = this.colNum - 1; j >= 0; j--) {
                if (starRow_array[this.colNum - j - 1]) {
                    temp_star = starRow_array[this.colNum - j - 1].star;
                    this.star_array[j][i] = starRow_array[this.colNum - j - 1];
                    this.star_array[j][i].colNum = j;
                }
                else {
                    this.star_array[j][i] = undefined;
                }
            }
        }
        //检测横排 重排数组
        var starCol_array = new Array();
        var mcX;
        var k;
        for (i = this.rowNum - 1; i >= 0; i--) {
            starCol_array = new Array();
            for (j = this.colNum - 1; j >= 0; j--) {
                if (this.star_array[j][i] != undefined) {
                    starCol_array.push(this.star_array[j][i]);
                }
            }
            if (starCol_array.length == 0 && i + 1 < this.rowNum) {
                for (k = i + 1; k < this.rowNum; k++) {
                    for (j = this.colNum - 1; j >= 0; j--) {
                        if (this.star_array[j][k] != undefined) {
                            this.star_array[j][k - 1] = this.star_array[j][k];
                            this.star_array[j][k] = undefined;
                            this.star_array[j][k - 1].rowNum = k - 1;
                        }
                    }
                }
            }
        }
        //根据数组 移动位置
        for (i = 0; i < this.rowNum; i++) {
            for (j = 0; j < this.colNum; j++) {
                if (this.star_array[j][i]) {
                    temp_star = this.star_array[j][i].star;
                    mcX = this.star_array[j][i].rowNum * this.spaceX + temp_star.width / 2;
                    mcY = this.star_array[j][i].colNum * this.spaceY + temp_star.height / 2;
                    egret.Tween.removeTweens(temp_star);
                    egret.Tween.get(temp_star).to({ x: mcX, y: mcY }, 200, egret.Ease.backIn);
                }
            }
        }
    };
    p.finishGame = function () {
        var temp_star;
        var i;
        var j;
        this.count = 0;
        for (i = 0; i < this.colNum; i++) {
            for (j = 0; j < this.rowNum; j++) {
                if (this.star_array[i][j]) {
                    temp_star = this.star_array[i][j].star;
                    egret.Tween.get(temp_star).wait(this.count * 100 + 500).to({ scaleX: 0.1, scaleY: 0.1, alpha: 0 }, 200, egret.Ease.circOut).call(this.funcComplete, this, [temp_star]);
                    temp_star.touchEnabled = false;
                    temp_star.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandle, this);
                    this.star_array[i][j] = undefined;
                    this.count++;
                    if (this.count > 7) {
                        this.count = 7;
                    }
                }
            }
        }
    };
    p.getSource = function (_starNum) {
        var _source = 0;
        if (_starNum >= 2) {
            var _sourceStep = 10;
            _sourceStep = _sourceStep + (_starNum - 2) * _sourceStep;
            _source = _starNum * _sourceStep;
        }
        return _source;
    };
    return GameView;
}(egret.DisplayObjectContainer));
egret.registerClass(GameView,'GameView');
