/*jshint -W051 */
var ctx;
var frame = 0;
var interval;
var end_flag = 0;


//読み込み時実行
$(function(){
	var canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	ctx.font = '24px mplus-1p-regular';
	ctx.lineWidth = 3;
	ctx.strokeStyle = 'black';
	ctx.fillStyle = "white";
	rank.load();
    
    //画像読み込ませた後、スタートタイトル表示
	Asset.loadAssets(function(){
		ctx.strokeText("クリックでスタート", 300, 100);
        ctx.fillText("クリックでスタート", 300, 100);
        $('canvas').click(start);
    });
    
    //アンドロイド用ボタン
    $("div#up").mousedown(function(){
        rockman.moveflag = 1;
    });
    $("div#right").mousedown(function(){
        rockman.moveflag = 2;
    });
    $("div#down").mousedown(function(){
        rockman.moveflag = 3;
    });
    $("div#left").mousedown(function(){
        rockman.moveflag = 4;
    });
    $("div#atack").mousedown(function(){
        rockman.flag.rockbaster = 1;
    });

});


function start(){
    $('canvas').unbind('click');
	field_crate();
  	character_create();
  	interval = window.setInterval(update,30);
}

//フレーム動作関数
function update(){
	//全部削除
	ctx.clearRect(0,0, 850,480);

	//フィールド描写
	for(var i=0; i<3; i++) for(var j=0; j<6; j++) field[i][j].draw();

	//自分描写
	rockman.move();
	rockman.rockbaster();
	rockman.draw();

	//敵描写
	gutsman.move();
	gutsman.atk();
	gutsman.draw();

	frame ++;

	if(end_flag ==1) {
		end_battle();
	}
}

//終わり
function end_battle(){
    clearInterval(interval);
	if(rockman.hp < 1){
		ctx.strokeText("Game Over", 360, 100);
        ctx.fillText("Game Over", 360, 100);
        ctx.strokeText("クリックでコンティニュー", 260, 130);
        ctx.fillText("クリックでコンティニュー", 260, 130);
        $('canvas').unbind('click');
        $('canvas').click(start);
        //色々オブジェクト削除
        frame = 0;
        end_flag = 0;
        //delete 
        
	}else{
		ctx.strokeText("Winner", 360, 100);
        ctx.fillText("Winner", 360, 100);
        ctx.strokeText("クリア時間 " + Math.floor(frame * 0.03) + "秒", 360, 130);
        ctx.fillText("クリア時間 " + Math.floor(frame * 0.03) + "秒", 360, 130);
        document.getElementsByClassName("rankig").item(0).style.display = "block";
	}
}

//ランキング
var rank = {
		write: function(){
			$.getJSON('js/save.php',{
				name:document.getElementById("name").value,
				day:new Date().toLocaleDateString(),
				time:Math.floor(frame * 0.03),
				hp:rockman.hp
			},
				function(result){
					document.getElementsByClassName("rankig").item(0).innerHTML = "登録しました";
				}
			);
		},
		load : function(){
			$.getJSON('js/load.php',{},
				function(result){
					result.sort(function(a,b){
					    if( Number(a[2]) < Number(b[2]) ) return -1;
					    if( Number(a[2]) > Number(b[2]) ) return 1;
					    return 0;
					});
					var table = document.getElementById("ranking_tbody");
					for(var i=0; i<result.length; i++ ){
						var rows = table.insertRow(-1);
						var cell = rows.insertCell(-1);
						cell.innerHTML = i+1 + "位";
//						var cell = rows.insertCell(-1);
                        rows.insertCell(-1).innerHTML = result[i][0];
//						var cell = rows.insertCell(-1);
                        rows.insertCell(-1).innerHTML = result[i][2] + "秒";
//						var cell = rows.insertCell(-1);
                        rows.insertCell(-1).innerHTML = result[i][3];
//						var cell = rows.insertCell(-1);
                        rows.insertCell(-1).innerHTML = result[i][1];
					}
				}
			);
		}

};
//ロックバスター
var Rockbaster =function(){
	this.on = 0;
	this.img = Asset.images.ball;
	this.x =6;
	this.y =-1;
	this.set_xy = function(){
		this.x =rockman.x;
		this.y =rockman.y;
	};
	this.beforeX = this.x;
	this.beforeY = this.y;
	this.gridX = 140 * this.x;
	this.gridY = 360-80 * this.y -100;
	this.draw = function(){
		this.gridX = 140 * this.x;
		this.gridY = 360-80 * this.y -40;
		ctx.drawImage(this.img, this.gridX, this.gridY);
	};
	this.stamp_frame = 0 ;
	this.form_frame = null;
	this.first_set =1;
	this.move = function(){
		//攻撃ポース
		if(frame > this.form_frame + 30 && this.on == 2){
			rockman.img = Asset.images.myself;
			this.on = 0;
		}

		if(this.on == 1){
			//初期位置
			if(this.first_set == 1) {
				this.set_xy();
				this.first_set =0;
				this.form_frame = frame;
				rockman.img = Asset.images.myself1;
			}
			//動く
			if(frame > this.stamp_frame + 3) {
				if(this.x == gutsman.x && this.y == gutsman.y){
					gutsman.hp -=10;
					this.x = 6;
				}
				this.x++;
				this.stamp_frame = frame;
			}
			//枠外超えたら
			if(this.x > 5) {
				this.on = 2;
				this.first_set = 1;
			}
			this.draw();
		}
	};
};

//ショックウェーブ
var Shockwave =function(){
	this.img = Asset.images.wave;
	this.x =gutsman.x-1;
	this.y =gutsman.y;
	this.beforeX = this.x;
	this.beforeY = this.y;
	this.gridX=null;
	this.gridY=null;
	this.height=0;
	this.draw = function(height){
		this.gridX = 140 * this.x;
		this.gridY = 360-80 * this.y -height;
		ctx.drawImage(this.img, this.gridX, this.gridY);
	};
	this.stamp_frame = frame ;
	this.speed = 5;
	this.move = function(speed){
		if(frame > this.stamp_frame + speed) {
			if(this.x == rockman.x && this.y == rockman.y){
				rockman.hp -=100;
				this.x = -1;
			}
			this.x--;
			this.stamp_frame = frame;
		}
		if(this.x < 0) delete this;
		this.draw(this.height);
	};
};

//ガッツパンチ
function GutsPanch(){
	Shockwave.apply(this,arguments);
	this.img = Asset.images.hand;
	this.height = 50;
	this.speed =3;
}


//ガッツマン
var Gutsman = function(){
	this.img = Asset.images.enemy0;
	this.flag = {
		move :1,
		atk : 1,
		atk_type : 0
	};
	this.x =4;
	this.y =1;
	this.beforeX = this.x;
	this.beforeY = this.y;
	this.gridX = 140 * this.x;
	this.gridY = 360-80 * this.y -100;
	this.stamp_frame = null;
	this.hp = 300;
	this.draw = function(){
		this.gridX = 140 * this.x;
		this.gridY = 360-80 * this.y -120;
		ctx.drawImage(this.img, this.gridX, this.gridY);
        ctx.strokeText(this.hp, this.gridX+40, this.gridY+20);
        ctx.fillText(this.hp, this.gridX+40, this.gridY+20);
        if(this.hp < 1) end_flag =1;
	};

	this.moveframe = 0;
	this.move = function(){
		if(this.flag.move == 1){
			var rnd_x = Math.floor( Math.random() * 3 );
			var rnd_y = Math.floor( Math.random() * 3 );
			this.x = 3 + rnd_x;
			this.y = rnd_y;
			this.moveframe = frame;
			this.flag.move = 0;
			this.flag.atk = 1;
		}
		if(frame > this.moveframe + 30){
			this.flag.move = 1;
		}
	};
	this.bullet = [null,null,null];
	this.atk = function(){
		if ( this.flag.atk == 1 ) {
			this.stamp_frame = frame;
			if(Math.floor( Math.random() * 2 ) == 1) {
				this.bullet[0] = new Shockwave();
				this.img = Asset.images.enemy2;
			}else{
				this.bullet[0] = new GutsPanch();
				this.img = Asset.images.enemy1;
			}
			this.flag.atk = 2;
		}else if(this.flag.atk == 2){
			if(frame > this.stamp_frame + 30){
				this.img = Asset.images.enemy0;
				this.flag.atk = 0;
			}else{
				this.bullet[0].move(this.bullet[0].speed);
			}
		}
	};
};
//キャラ
var Character = function(img,x,y){
	this.img = img;
	this.moveflag = 0;
	this.flag = {
		rockbaster : 0
	};
	this.x =x;
	this.y =y;
	this.beforeX = this.x;
	this.beforeY = this.y;
	this.gridX = 140 * this.x;
	this.gridY = 360-80 * this.y -100;
	this.stamp_frame = null;
	this.hp = 500;
	this.draw = function(){
		this.gridX = 140 * this.x;
		this.gridY = 360-80 * this.y -120;
		ctx.drawImage(this.img, this.gridX, this.gridY);
        ctx.strokeText(this.hp, this.gridX+60, this.gridY+20);
        ctx.fillText(this.hp, this.gridX+60, this.gridY+20);
        if(this.hp < 1) end_flag =1;
	};
	this.move = function(){
		if (this.moveflag !== 0){
			this.beforeX = this.x;
	    	this.beforeY = this.y;
			if ( this.moveflag == 1 ) this.y ++;
	    	else if ( this.moveflag == 2 ) this.x++;
	    	else if ( this.moveflag == 3 ) this.y --;
	    	else if ( this.moveflag == 4 ) this.x--;
	    	this.moveflag = 0;
	    	//範囲外には移動しない
	    	this.x = Math.min(this.x, 5);
	    	this.y = Math.min(this.y, 2);
	    	this.x = Math.max(this.x, 0);
	    	this.y = Math.max(this.y, 0);
	    	//もし進めなかったら
	    	if(field[this.y][this.x].owner ==1) {
	    		this.x = this.beforeX;
	    		this.y = this.beforeY;
	    	}
    	}
	};
	this.bullet = {
			0 :  new Rockbaster(),
			1 :  new Rockbaster(),
			2 :  new Rockbaster(),
			next :0,

	};
	this.rockbaster = function(){
		if ( this.flag.rockbaster == 1 ) {
			this.bullet[ this.bullet.next ].on = 1;
			this.bullet.next = (this.bullet.next +1) % 3;
			this.flag.rockbaster = 0;
		}
		for(var i=0; i<3; i++){
			this.bullet[i].move();
		}
	};

};
var rockman;
var gutsman;
function character_create(){
	rockman = new Character(Asset.images.myself,1,1);
	gutsman = new Gutsman();
}

/*-------------コマンド入力関係--------------------------------*/
document.addEventListener("keydown", KeyDownFunc);
document.addEventListener("keyup", KeyUpFunc);
var before_atk = 0;
function KeyDownFunc(e){
    event.preventDefault();
    if ( e.keyCode == 87 || e.keyCode == 38) rockman.moveflag = 1;
    else if ( e.keyCode == 68 || e.keyCode == 39) rockman.moveflag = 2;
    else if ( e.keyCode == 83 || e.keyCode == 40) rockman.moveflag = 3;
    else if ( e.keyCode == 65 || e.keyCode == 37) rockman.moveflag = 4;
    else if ( e.keyCode == 32 && before_atk === 0) {
    	rockman.flag.rockbaster = 1;
    	before_atk = 1;
    }
}
function KeyUpFunc(e){
    if ( e.keyCode == 32) {
    	before_atk = 0;
    }
}
/*---------------------------------------------*/


//フィールド
var Field = function(owner,x,y){
	this.img = Asset.images.field;
	this.destroy = 0;
	this.owner = owner;
	this.x =x;
	this.y =y;
	this.draw = function(){
		ctx.drawImage(this.img, this.x, this.y);
		if (this.owner === 0 ) ctx.strokeStyle = "red";
		else ctx.strokeStyle = "blue";
		ctx.strokeRect(this.x,this.y,138,79);
	};

};

//フィールドインスタンス生成
var field ={ 0:{}, 1:{}, 2 :{} };
function field_crate(){
	var owner = [0,0,0,1,1,1];
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 6; j++) {
			field[i][j] = new Field(owner[j], j*140 , 360 - i * 80);
		}
	}
}

var Asset = {};

// アセットの定義
Asset.assets = [
  { type: 'image', name: 'field', src: 'img/00.png' },
  { type: 'image', name: 'field1', src: 'img/01.png' },
  { type: 'image', name: 'field2', src: 'img/02.png' },
  { type: 'image', name: 'myself', src: 'img/myself.png' },
  { type: 'image', name: 'myself1', src: 'img/kamae.png' },
  { type: 'image', name: 'ball', src: 'img/ball.png' },
  { type: 'image', name: 'enemy0', src: 'img/enemy0.png' },
  { type: 'image', name: 'enemy1', src: 'img/enemy1.png' },
  { type: 'image', name: 'enemy2', src: 'img/enemy2.png' },
  { type: 'image', name: 'wave', src: 'img/wave.png' },
  { type: 'image', name: 'hand', src: 'img/hand.png' }
];

// 読み込んだ画像
Asset.images = {};

// アセットの読み込み
Asset.loadAssets = function(onComplete) {
  var total = Asset.assets.length; // アセットの合計数
  var loadCount = 0; // 読み込み完了したアセット数

  // アセットが読み込み終わった時に呼ばれるコールバック関数
  var onLoad = function() {
    loadCount++; // 読み込み完了数を1つ足す
    if (loadCount >= total) {
      // すべてのアセットの読み込みが終わった後のコールバック
      onComplete();
    }
  };

  // すべてのアセットを読み込む
  Asset.assets.forEach(function(asset) {
    switch (asset.type) {
      case 'image':
        Asset._loadImage(asset, onLoad);
        break;
    }
  });
};

// 画像の読み込み
Asset._loadImage = function(asset, onLoad) {
  var image = new Image();
  image.src = asset.src;
  image.onload = onLoad;
  Asset.images[asset.name] = image;
};