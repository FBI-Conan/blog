# canvas 实例

## 绘制虚线

![canvas 虚线](/assets/img/canvas/dottedLine.png)

绘制虚线的思想就是将多根短实线等间隔组合而成

```html
<canvas width="500" height="500" style="border: 2px solid #000"></canvas>
<script>
	const canvasRef = document.querySelector("canvas");
	const context = canvasRef.getContext("2d");

	// 封装画线功能
	function drawLine(startX, startY, endX, enndY, color = context.strokeStyle) {
		context.save();
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(endX, enndY);
		if (color !== context.strokeStyle) {
			context.strokeStyle = color;
		}
		context.stroke();
		context.closePath();
		context.restore();
	}

	// 线宽由 lineWidth 决定
	context.lineWidth = 2;

	// 循环绘制短实线
	for (let i = 0; i < 20; i++) {
		drawLine(100 + i * 10, 100 + i * 5, 105 + i * 10, 102.5 + i * 5, "#000000");
	}
</script>
```

## 动态画圆

<img src='/assets/img/canvas/dynamicCircle.gif' alt='canvas 动态画圆' width="300px">

**需求**：将一个圆形从 0 度到 2π 的绘制过程动态的展示出来。

**需求分析**：凡是动态的绘制，都是利用定时器进行处理的。或每一帧都清除画布再绘制，或将图进行拆解，每帧绘制一点点。

```html
<canvas width="500" height="500" style="border: 2px solid #000"></canvas>
<script>
	const canvasRef = document.querySelector("canvas");
	const context = canvasRef.getContext("2d");

	// 每次绘制一段圆弧，并记录下圆弧的起点和终点角度
	const deg = Math.PI / 180;
	let startDeg = 0;
	let endDeg;

	const timer = setInterval(() => {
		endDeg = startDeg + 4 * deg;
		context.beginPath();
		context.arc(150, 300, 100, startDeg, endDeg);
		context.stroke();
		startDeg = endDeg;
		// 绘制完成一个整圆后停掉定时器
		if (startDeg >= 2 * Math.PI) {
			clearInterval(timer);
			context.closePath();
		}
	}, 100);
</script>
```

## 动态小球

<img src='/assets/img/canvas/dynamicBall.gif' alt='canvas 动态小球' width="300px">

**需求**：随机在画布中生成运动的小球（颜色、大小、初始位置、运动速度都具有一定的随机性），小球碰到画布边界会反弹继续运动。

**需求分析**：小球进行运动，每一帧都需要清除画布内容，进行绘制当前帧的小球。面向对象编程思想，创建小球类。

```html
<canvas width="500" height="500" style="border: 2px solid #000"></canvas>
<script>
	const canvasRef = document.querySelector("canvas");
	const context = canvasRef.getContext("2d");

	// 获取当前画布的大小，后续碰撞检测需要
	const width = canvasRef.width;
	const height = canvasRef.height;

	// 随机产生范围内的整数，包括边界值
	function randomInt(minNum, maxNum) {
		return Math.round(Math.random() * (maxNum - minNum)) + minNum;
	}

	class Ball {
		// 画布属性
		ctx = context;
		width = width;
		height = height;
		// 小球属性
		ballRadius = randomInt(30, 40);
		ballX = randomInt(this.ballRadius, this.width - this.ballRadius);
		ballY = randomInt(this.ballRadius, this.height - this.ballRadius);
		// vx: [-5, 5]
		vx = (Math.random > 0.5 ? 1 : -1) * randomInt(1, 5);
		// vy: [-3, 3]
		vy = (Math.random > 0.5 ? 1 : -1) * randomInt(1, 3);
		// 颜色随机
		color = "#" + Math.round(Math.random() * 0xffffff).toString(16);
		constructor() {
			this.run();
		}
		run() {
			this.ctx.save();
			this.ctx.fillStyle = this.color;
			this.ctx.beginPath();
			let newX = this.ballX + this.vx;
			let newY = this.ballY + this.vy;
			// 是否超出边界，如果超出，则重新计算位置，并且控制方向
			if (newX > this.width - this.ballRadius) {
				newX =
					this.width - this.ballRadius - (newX - this.width + this.ballRadius);
				this.vx = -this.vx;
			} else if (newX < this.ballRadius) {
				newX = this.ballRadius + (this.ballRadius - newX);
				this.vx = -this.vx;
			}
			if (newY > this.height - this.ballRadius) {
				newY =
					this.height -
					this.ballRadius -
					(newY - this.height + this.ballRadius);
				this.vy = -this.vy;
			} else if (newY < this.ballRadius) {
				newY = this.ballRadius + (this.ballRadius - newY);
				this.vy = -this.vy;
			}
			this.ctx.arc(
				(this.ballX = newX),
				(this.ballY = newY),
				this.ballRadius,
				0,
				2 * Math.PI
			);
			this.ctx.fill();
			this.ctx.closePath();
			this.ctx.restore();
		}
	}

	const balls = [];
	// 生成一定数量的小球
	for (let index = 0; index < 10; index++) {
		balls.push(new Ball());
	}
	// 逐帧清除画布，重新绘制新状态下的小球
	setInterval(() => {
		context.clearRect(0, 0, width, height);
		balls.forEach(ball => ball.run());
	});
</script>
```

## 鼠标移动特效（炫彩小球）

<img src='/assets/img/canvas/mouseSpecialEffect.gif' alt='canvas 鼠标特效' width="300px">

**需求**：鼠标每移动到新的位置，生成颜色随机的小球，且小球的半径逐渐减小至消失。

**需求分析**：创建小球类，小球的位置需要监听鼠标的移动事件，获取鼠标位置。

```html
<style>
	html,
	body {
		margin: 0;
		padding: 0;
	}
</style>

<canvas width="500" height="500" style="border: 2px solid #000"></canvas>

<script>
	const canvasRef = document.querySelector("canvas");
	const context = canvasRef.getContext("2d");
	// 炫彩小球
	class Ball {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.color = "#" + Math.round(Math.random() * 0xffffff).toString(16);
			this.radius = 40;
			// 画布
			this.ctx = context;
			this.draw();
		}
		draw() {
			this.ctx.save();
			this.ctx.beginPath();
			this.ctx.fillStyle = this.color;
			this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
			this.ctx.closePath();
			this.ctx.fill();
			this.ctx.restore();
			this.radius--;
		}
		get isZero() {
			return this.radius <= 0;
		}
	}

	const balls = [];

	let produceBall = true;

	// 监听鼠标的移动事件
	window.addEventListener("mousemove", e => {
		if (produceBall) {
			const ball = new Ball(
				e.clientX - canvasRef.clientLeft,
				e.clientY - canvasRef.clientTop
			);
			balls.push(ball);
			// 限制两个新小球之间的最小生成间隔
			produceBall = false;
			setTimeout(() => {
				produceBall = true;
			}, 30);
		}
	});

	// 定时循环清除画布并绘制下一时刻的小球状态
	setInterval(() => {
		context.clearRect(0, 0, canvasRef.width, canvasRef.height);
		for (let index = balls.length - 1; index >= 0; index--) {
			const ball = balls[index];
			if (ball.isZero) {
				balls.splice(index, 1);
			} else {
				ball.draw();
			}
		}
	}, 15);
</script>
```

## 动态时钟

<img src='/assets/img/canvas/clock.gif' alt='canvas 动态时钟' width="300px">

**需求**：准确绘制一个动态时钟

**需求分析**：通过角度和半径计算出点的坐标位置，剩下的就是画线、画圆

```html
<style>
	.clock {
		background: #ddd;
		width: 400px;
		margin: 100px auto;
		border-radius: 20px;
	}
</style>
<div class="clock">
	<canvas width="400" height="400"></canvas>
</div>

<script>
	const canvasRef = document.querySelector("canvas");
	const context = canvasRef.getContext("2d");

	// 移动坐标原点至画布中心
	context.translate(200, 200);

	class Clock {
		ctx = context; // 画布上下文

		radius = 180; // 时钟半径
		r_hour = 60; // 时针长度
		r_minute = 120; // 分针长度
		r_second = 140; // 秒针长度
		r_number = 140; // 数字位置的半径
		r_scale_s = 165; // 小刻度
		r_scale_l = 162; // 大刻度

		constructor() {
			/**
			 * 位置坐标公式
			 * x = r * Math.cos(deg)
			 * y = r * Math.sin(deg)
			 */
			this.drawOutline();
			this.drawScale();
			this.drawNumber();
			this.drawPointer();
			this.drawNut();
		}

		// 时钟轮廓
		drawOutline() {
			this.drawSolidCircle(0, 0, this.radius, "#ffffff");
		}

		// 刻度
		drawScale() {
			for (let index = 0; index < 60; index++) {
				const deg = ((2 * Math.PI) / 60) * index;
				let x1 = this.radius * Math.cos(deg),
					y1 = this.radius * Math.sin(deg),
					x2,
					y2;
				if (index % 5 === 0) {
					// 大刻度（更长更宽）
					x2 = this.r_scale_l * Math.cos(deg);
					y2 = this.r_scale_l * Math.sin(deg);
					this.drawLine(x1, y1, x2, y2, "#ff0000", 3);
				} else {
					// 小刻度（更短更窄）
					x2 = this.r_scale_s * Math.cos(deg);
					y2 = this.r_scale_s * Math.sin(deg);
					this.drawLine(x1, y1, x2, y2, "#333333", 2);
				}
			}
		}

		// 数字
		drawNumber() {
			this.ctx.save();
			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "middle";
			this.ctx.font = "20px Times New Roman";
			// 1/12等分的角度
			const deg = Math.PI / 6;
			for (let index = 1; index <= 12; index++) {
				const x = this.r_number * Math.cos(index * deg - Math.PI / 2);
				const y = this.r_number * Math.sin(index * deg - Math.PI / 2);
				this.ctx.fillText(index, x, y);
			}
			this.ctx.restore();
		}

		// 时针/分针/秒针
		drawPointer() {
			const time = new Date();
			const hour = time.getHours();
			const minute = time.getMinutes();
			const second = time.getSeconds();

			// 三针的角度（与 12 点钟方向的顺时针夹角）
			const deg_h =
				((hour % 12) / 12) * 2 * Math.PI +
				(minute / 60) * ((2 * Math.PI) / 12) +
				(second / 60) * ((2 * Math.PI) / 12 / 60);
			const deg_m = (minute / 60) * 2 * Math.PI;
			const deg_s = (second / 60) * 2 * Math.PI;

			// 计算三针针头的横纵坐标（需要的是针与三点钟方向的顺时针夹角：-pi/2）
			const x_h = this.r_hour * Math.cos(deg_h - Math.PI / 2);
			const y_h = this.r_hour * Math.sin(deg_h - Math.PI / 2);
			const x_m = this.r_minute * Math.cos(deg_m - Math.PI / 2);
			const y_m = this.r_minute * Math.sin(deg_m - Math.PI / 2);
			const x_s = this.r_second * Math.cos(deg_s - Math.PI / 2);
			const y_s = this.r_second * Math.sin(deg_s - Math.PI / 2);

			// 绘制时针
			this.drawLine(0, 0, x_h, y_h, "#000000", 8, "round");
			// 绘制分针
			this.drawLine(0, 0, x_m, y_m, "#000000", 4, "round");
			// 绘制秒针
			this.drawLine(0, 0, x_s, y_s, "#ff0000", 2);
		}

		// 时钟中心的螺帽
		drawNut() {
			this.drawSolidCircle(0, 0, 8, "#000000");
		}

		// 画线功能封装
		drawLine(startX, startY, endX, endY, color, width, cap) {
			this.ctx.save();
			if (color) {
				this.ctx.strokeStyle = color;
			}
			if (width) {
				this.ctx.lineWidth = width;
			}
			if (cap) {
				this.ctx.lineCap = cap;
			}
			this.ctx.beginPath();
			this.ctx.moveTo(startX, startY);
			this.ctx.lineTo(endX, endY);
			this.ctx.stroke();
			this.ctx.restore();
		}

		// 画实心圆功能封装
		drawSolidCircle(x, y, r, color) {
			this.ctx.save();
			this.ctx.beginPath();
			if (color) {
				this.ctx.fillStyle = color;
			}
			this.ctx.arc(x, y, r, 0, 2 * Math.PI);
			this.ctx.fill();
			this.ctx.restore();
		}
	}

	new Clock();
	setInterval(() => {
		context.clearRect(0, 0, canvasRef.width, canvasRef.height);
		new Clock();
	}, 1000);
</script>
```

## 像素字体

![canvas 像素字体](/assets/img/canvas/pixelText.png)

**需求**：将普通字体转变成像素字体。

**需求分析**：`getImageData` 可以获取图像数据，一个像素点包含 rgba 四种信息，根据 rgba 可以获取字体的像素点位置，从而重新绘制像素字体。

```html
<style>
	canvas {
		border: 2px solid #000;
	}
</style>

<canvas width="400" height="400"></canvas>

<script>
	const canvasRef = document.querySelector("canvas");
	const context = canvasRef.getContext("2d");

	const width = canvasRef.width;
	const height = canvasRef.height;

	// 写字
	context.font = "120px 微软雅黑";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText("强", 200, 200);

	// 获取图像数据
	const imgData = context.getImageData(0, 0, width, height);

	// 清除画布
	context.clearRect(0, 0, width, height);

	const leap = 4;
	for (let x = 0; x < width; x += leap) {
		for (let y = 0; y < height; y += leap) {
			// 像素索引
			const pixelIndex = x + y * width;
			// 获取每个像素的透明度
			const pixelA = imgData.data[pixelIndex * 4 + 3];

			if (pixelA > 128) {
				// 有内容
				drawSoildCircle(x, y, 1, "#00ff00");
			}
		}
	}

	// 画实心圆
	function drawSoildCircle(x, y, r, color) {
		context.save();
		context.beginPath();
		if (color) {
			context.fillStyle = color;
		}
		context.arc(x, y, r, 0, 2 * Math.PI);
		context.fill();
		context.restore();
	}
</script>
```
