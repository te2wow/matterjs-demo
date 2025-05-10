// Matter.jsモジュールを取得
const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Composite = Matter.Composite;
const Composites = Matter.Composites;
const Constraint = Matter.Constraint;
const MouseConstraint = Matter.MouseConstraint;
const Mouse = Matter.Mouse;
const World = Matter.World;
const Events = Matter.Events;
const Common = Matter.Common;

// エンジンを作成
const engine = Engine.create();
const world = engine.world;

// レンダラーを作成
const canvas = document.getElementById('canvas');
const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: window.innerWidth - 250,
        height: window.innerHeight,
        wireframes: false,
        background: '#f0f0f0',
    }
});

// レンダラーを実行
Render.run(render);

// ランナーを作成
const runner = Runner.create();
Runner.run(runner, engine);

// マウス制御を追加
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

World.add(world, mouseConstraint);

// キャンバスのリサイズ処理
window.addEventListener('resize', function() {
    render.options.width = window.innerWidth - 250;
    render.options.height = window.innerHeight;
    render.canvas.width = render.options.width;
    render.canvas.height = render.options.height;
});

// 現在のデモを保持する変数
let currentDemo = null;

// ワールドをリセットする関数
function resetWorld() {
    World.clear(world);
    World.add(world, mouseConstraint);
    engine.gravity.x = 0;
    engine.gravity.y = 1;
    engine.timing.timeScale = 1;
}

// 各デモ関数
const demos = {
    // 基本物理演算
    basic: function() {
        resetWorld();
        
        // 地面
        const ground = Bodies.rectangle(
            render.options.width / 2, 
            render.options.height, 
            render.options.width, 
            50, 
            { isStatic: true }
        );
        
        // 複数の形状を追加
        const circle = Bodies.circle(
            render.options.width / 2, 
            100, 
            40, 
            { restitution: 0.8, friction: 0.1 }
        );
        
        const square = Bodies.rectangle(
            render.options.width / 2 - 100, 
            60, 
            60, 
            60, 
            { restitution: 0.8, friction: 0.1 }
        );
        
        const polygon = Bodies.polygon(
            render.options.width / 2 + 100, 
            60, 
            6, 
            40, 
            { restitution: 0.6, friction: 0.1 }
        );
        
        World.add(world, [ground, circle, square, polygon]);
        
        // 定期的に新しい物体を追加
        const interval = setInterval(() => {
            if (currentDemo !== 'basic') {
                clearInterval(interval);
                return;
            }
            
            const shape = Math.random() > 0.5 
                ? Bodies.circle(
                    Common.random(50, render.options.width - 50), 
                    10, 
                    Common.random(15, 30), 
                    { restitution: 0.8, friction: 0.1 }
                )
                : Bodies.polygon(
                    Common.random(50, render.options.width - 50), 
                    10, 
                    Math.round(Common.random(3, 7)), 
                    Common.random(15, 30), 
                    { restitution: 0.8, friction: 0.1 }
                );
                
            World.add(world, shape);
        }, 1000);
    },

    // 重力方向変更
    gravity: function() {
        resetWorld();
        
        // 壁を作成
        const wallOptions = { isStatic: true, render: { fillStyle: '#222' } };
        const ground = Bodies.rectangle(render.options.width / 2, render.options.height, render.options.width, 50, wallOptions);
        const ceiling = Bodies.rectangle(render.options.width / 2, 0, render.options.width, 50, wallOptions);
        const leftWall = Bodies.rectangle(0, render.options.height / 2, 50, render.options.height, wallOptions);
        const rightWall = Bodies.rectangle(render.options.width, render.options.height / 2, 50, render.options.height, wallOptions);
        
        // 複数のボールを追加
        const balls = [];
        for (let i = 0; i < 40; i++) {
            const ball = Bodies.circle(
                Common.random(50, render.options.width - 50),
                Common.random(50, render.options.height - 50),
                Common.random(10, 20),
                {
                    restitution: 0.8,
                    friction: 0.1,
                    render: {
                        fillStyle: '#' + Math.floor(Math.random() * 16777215).toString(16)
                    }
                }
            );
            balls.push(ball);
        }
        
        World.add(world, [ground, ceiling, leftWall, rightWall, ...balls]);
        
        // 重力方向を変更するタイマー
        const interval = setInterval(() => {
            if (currentDemo !== 'gravity') {
                clearInterval(interval);
                return;
            }
            
            // ランダムな重力方向を設定
            const angle = Math.random() * Math.PI * 2;
            engine.gravity.x = Math.sin(angle);
            engine.gravity.y = Math.cos(angle);
            
        }, 3000);
    },

    // 重力強度変更
    'gravity-strength': function() {
        resetWorld();
        
        // エンジンの重力を0に設定
        engine.gravity.y = 0;
        
        // 壁を作成
        const wallOptions = { isStatic: true, render: { fillStyle: '#222' } };
        const ground = Bodies.rectangle(render.options.width / 2, render.options.height, render.options.width, 50, wallOptions);
        const ceiling = Bodies.rectangle(render.options.width / 2, 0, render.options.width, 50, wallOptions);
        const leftWall = Bodies.rectangle(0, render.options.height / 2, 50, render.options.height, wallOptions);
        const rightWall = Bodies.rectangle(render.options.width, render.options.height / 2, 50, render.options.height, wallOptions);
        
        // 異なる密度と大きさの物体を追加
        const objects = [];
        
        // 色ごとの重力値を定義
        const gravityByColor = {
            red: 0.01,      // 強い重力
            blue: 0.005,    // 普通の重力
            green: -0.003,  // 上向きの重力
            yellow: 0       // 無重力
        };
        
        // 各色のボールを1個ずつ配置
        const colors = ['red', 'blue', 'green', 'yellow'];
        const startX = render.options.width / 2;
        const startY = 100;
        const spacing = 150;
        
        colors.forEach((color, index) => {
            const x = startX + (index - 1.5) * spacing;
            const y = startY;
            
            const circle = Bodies.circle(
                x, y, 30,
                {
                    restitution: 0.5,
                    friction: 0.5,
                    density: 0.001,
                    render: {
                        fillStyle: color
                    },
                    // カスタムプロパティとして重力値を保存
                    gravityValue: gravityByColor[color]
                }
            );
            
            objects.push(circle);
        });
        
        World.add(world, [ground, ceiling, leftWall, rightWall, ...objects]);
        
        // 各ボールの重力を更新する関数
        const updateGravity = function() {
            const bodies = Composite.allBodies(world);
            for (let i = 0; i < bodies.length; i++) {
                const body = bodies[i];
                if (!body.isStatic && body.gravityValue !== undefined) {
                    // ボールの位置に応じて重力を設定
                    Body.applyForce(body, body.position, {
                        x: 0,
                        y: body.gravityValue
                    });
                }
            }
        };
        
        // エンジンの更新イベントで重力を更新
        Events.on(engine, 'beforeUpdate', updateGravity);
        
        // デモが終了したらイベントリスナーを削除
        const cleanup = function() {
            Events.off(engine, 'beforeUpdate', updateGravity);
        };
        
        // デモが切り替わったときにクリーンアップ
        Events.on(mouseConstraint, 'mousedown', function(event) {
            if (currentDemo !== 'gravity-strength') {
                cleanup();
            }
        });
    },

    // 接続と制約
    constraints: function() {
        resetWorld();
        
        // 地面
        const ground = Bodies.rectangle(
            render.options.width / 2, 
            render.options.height, 
            render.options.width, 
            50, 
            { isStatic: true }
        );
        
        World.add(world, ground);
        
        // 振り子を作成
        const pendulumCount = 10;
        const ballRadius = 30;
        const spacing = ballRadius * 2; // 玉の直径分の間隔
        const startX = (render.options.width - (pendulumCount - 1) * spacing) / 2; // 中央揃え
        
        for (let i = 0; i < pendulumCount; i++) {
            const position = startX + i * spacing;
            
            const pendulum = Bodies.circle(
                position, 
                300, 
                ballRadius, 
                { 
                    friction: 0.001,
                    restitution: 0.99,
                    render: {
                        fillStyle: `hsl(${360 * i / pendulumCount}, 80%, 60%)`
                    }
                }
            );
            
            const constraint = Constraint.create({
                pointA: { x: position, y: 50 },
                bodyB: pendulum,
                length: 200,
                stiffness: 0.1,
                damping: 0.05
            });
            
            World.add(world, [pendulum, constraint]);
        }
    },

    // 自動車シミュレーション
    car: function() {
        resetWorld();
        
        // 凸凹の地面を作成
        const terrainSegments = 20;
        const terrainWidth = render.options.width;
        const segmentWidth = terrainWidth / terrainSegments;
        const amplitude = 50;
        const groundY = render.options.height - 100;
        
        let terrain = [];
        for (let i = 0; i <= terrainSegments; i++) {
            const x = i * segmentWidth;
            const y = groundY + amplitude * Math.sin(i * 0.4);
            
            if (i > 0) {
                const prevX = (i - 1) * segmentWidth;
                const prevY = groundY + amplitude * Math.sin((i - 1) * 0.4);
                
                const segment = Bodies.rectangle(
                    (prevX + x) / 2,
                    (prevY + y) / 2,
                    segmentWidth,
                    10,
                    {
                        isStatic: true,
                        angle: Math.atan2(y - prevY, x - prevX),
                        render: {
                            fillStyle: '#060'
                        }
                    }
                );
                
                terrain.push(segment);
            }
        }
        
        // 境界壁
        const leftWall = Bodies.rectangle(0, groundY - 200, 50, 400, { isStatic: true });
        const rightWall = Bodies.rectangle(terrainWidth, groundY - 200, 50, 400, { isStatic: true });
        
        // 車体と車輪を作成
        const wheelRadius = 20;
        const wheelBase = 100;
        const carX = 200;
        const carY = groundY - 100;
        
        // 車体
        const carBody = Bodies.rectangle(carX, carY, 150, 30, { 
            density: 0.002,
            friction: 0.01
        });
        
        // 車輪
        const wheelA = Bodies.circle(carX - wheelBase / 2, carY + 20, wheelRadius, { 
            density: 0.001,
            friction: 0.8,
            render: {
                fillStyle: '#222'
            }
        });
        
        const wheelB = Bodies.circle(carX + wheelBase / 2, carY + 20, wheelRadius, { 
            density: 0.001,
            friction: 0.8,
            render: {
                fillStyle: '#222'
            }
        });
        
        // バネで車輪と車体を接続
        const axelA = Constraint.create({
            bodyA: carBody,
            bodyB: wheelA,
            pointA: { x: -wheelBase / 2, y: 0 },
            stiffness: 0.5,
            length: 20
        });
        
        const axelB = Constraint.create({
            bodyA: carBody,
            bodyB: wheelB,
            pointA: { x: wheelBase / 2, y: 0 },
            stiffness: 0.5,
            length: 20
        });
        
        World.add(world, [
            ...terrain,
            leftWall,
            rightWall,
            carBody,
            wheelA,
            wheelB,
            axelA,
            axelB
        ]);
        
        // 速度を与えて車を動かす
        Body.setVelocity(carBody, { x: 5, y: 0 });
        
        // 定期的に力を加えて動き続けるようにする
        const interval = setInterval(() => {
            if (currentDemo !== 'car') {
                clearInterval(interval);
                return;
            }
            
            // 右向きの力を加える
            Body.applyForce(wheelA, 
                { x: wheelA.position.x, y: wheelA.position.y },
                { x: 0.02, y: 0 }
            );
            Body.applyForce(wheelB, 
                { x: wheelB.position.x, y: wheelB.position.y },
                { x: 0.02, y: 0 }
            );
            
            // 画面外に出たら位置をリセット
            if (carBody.position.x > render.options.width + 100) {
                Body.setPosition(carBody, { x: 100, y: carY });
                Body.setPosition(wheelA, { x: 100 - wheelBase / 2, y: carY + 20 });
                Body.setPosition(wheelB, { x: 100 + wheelBase / 2, y: carY + 20 });
                Body.setVelocity(carBody, { x: 5, y: 0 });
                Body.setVelocity(wheelA, { x: 5, y: 0 });
                Body.setVelocity(wheelB, { x: 5, y: 0 });
            }
        }, 100);
    },

    // 積み木崩し
    stack: function() {
        resetWorld();
        
        // 地面
        const ground = Bodies.rectangle(render.options.width / 2, render.options.height, render.options.width, 50, { 
            isStatic: true,
            render: { fillStyle: '#888' }
        });
        
        // ブロックの色とサイズ
        const blockColors = ['#D00', '#0D0', '#00D', '#DD0', '#0DD', '#D0D'];
        const blockWidth = 60;
        const blockHeight = 60;
        
        // タワーの高さとブロック数
        const towerHeight = 10;
        const blocksPerRow = 6;
        
        // 複数のタワーを構築
        for (let tower = 0; tower < 3; tower++) {
            const towerX = render.options.width * (tower + 1) / 4;
            const towerBase = render.options.height - 25;
            
            // 積み木タワーを作成
            for (let row = 0; row < towerHeight; row++) {
                const isEvenRow = row % 2 === 0;
                const rowBlocks = isEvenRow ? blocksPerRow : blocksPerRow - 1;
                const rowWidth = rowBlocks * blockWidth;
                const rowStartX = towerX - (rowWidth / 2) + (isEvenRow ? 0 : blockWidth / 2);
                
                for (let col = 0; col < rowBlocks; col++) {
                    const x = rowStartX + col * blockWidth + blockWidth / 2;
                    const y = towerBase - (row + 0.5) * blockHeight;
                    
                    const block = Bodies.rectangle(x, y, blockWidth, blockHeight, {
                        restitution: 0.1,
                        friction: 0.8,
                        render: { 
                            fillStyle: blockColors[row % blockColors.length] 
                        }
                    });
                    
                    World.add(world, block);
                }
            }
        }
        
        // 重い球を落下させる
        const interval = setInterval(() => {
            if (currentDemo !== 'stack') {
                clearInterval(interval);
                return;
            }
            
            const ball = Bodies.circle(
                Common.random(100, render.options.width - 100),
                0,
                Common.random(20, 40),
                {
                    density: 0.02,
                    restitution: 0.1,
                    friction: 0.05,
                    render: {
                        fillStyle: '#000'
                    }
                }
            );
            
            World.add(world, ball);
        }, 5000);
        
        World.add(world, ground);
    },

    // ピラミッド構造
    pyramid: function() {
        resetWorld();
        
        // 地面
        const ground = Bodies.rectangle(render.options.width / 2, render.options.height, render.options.width, 50, { 
            isStatic: true,
            render: { fillStyle: '#888' }
        });
        
        World.add(world, ground);
        
        // ピラミッドのパラメータ
        const pyramidBase = 20;  // ピラミッドの底辺のブロック数
        const blockSize = 30;    // ブロックのサイズ
        const pyramidX = render.options.width / 2;
        const pyramidY = render.options.height - 25;
        
        // ピラミッドの各レベルを作成
        for (let level = 0; level < pyramidBase; level++) {
            const blocksInLevel = pyramidBase - level;
            const levelWidth = blocksInLevel * blockSize;
            const levelStartX = pyramidX - levelWidth / 2 + blockSize / 2;
            
            for (let i = 0; i < blocksInLevel; i++) {
                const x = levelStartX + i * blockSize;
                const y = pyramidY - (level + 0.5) * blockSize;
                
                // HSLカラーでグラデーションを作成
                const hue = (360 * level / pyramidBase) % 360;
                const fillColor = `hsl(${hue}, 80%, 60%)`;
                
                const block = Bodies.rectangle(x, y, blockSize, blockSize, {
                    friction: 1,
                    restitution: 0.1,
                    render: {
                        fillStyle: fillColor
                    }
                });
                
                World.add(world, block);
            }
        }
        
        // マウスでドラッグした時に爆発効果を追加
        let isExploding = false;
        
        Events.on(mouseConstraint, 'startdrag', function(event) {
            if (currentDemo === 'pyramid' && !isExploding) {
                isExploding = true;
                
                // ドラッグされた物体に爆発力を追加
                const explosion = function(body) {
                    const bodies = Composite.allBodies(world);
                    
                    for (let i = 0; i < bodies.length; i++) {
                        const targetBody = bodies[i];
                        
                        if (targetBody !== body && !targetBody.isStatic) {
                            const direction = {
                                x: targetBody.position.x - body.position.x,
                                y: targetBody.position.y - body.position.y
                            };
                            
                            // 距離を計算
                            const distance = Math.sqrt(
                                Math.pow(direction.x, 2) + 
                                Math.pow(direction.y, 2)
                            );
                            
                            // 距離に応じて力を減衰
                            const forceMagnitude = 0.05 * (100 / Math.max(1, distance));
                            
                            // 方向を正規化
                            const normalizedDirection = {
                                x: direction.x / distance,
                                y: direction.y / distance
                            };
                            
                            // 力を適用
                            Body.applyForce(targetBody, targetBody.position, {
                                x: normalizedDirection.x * forceMagnitude,
                                y: normalizedDirection.y * forceMagnitude
                            });
                        }
                    }
                    
                    // 一定時間後に爆発状態を解除
                    setTimeout(() => {
                        isExploding = false;
                    }, 1000);
                };
                
                explosion(event.body);
            }
        });
        
        // 定期的に新しいブロックを追加してピラミッドを維持
        const interval = setInterval(() => {
            if (currentDemo !== 'pyramid') {
                clearInterval(interval);
                return;
            }
            
            // ワールド内のブロック数をカウント
            const bodies = Composite.allBodies(world);
            const blockCount = bodies.filter(body => !body.isStatic).length;
            
            // ブロック数が一定以下なら新しいブロックを追加
            if (blockCount < 50) {
                const size = Common.random(20, 40);
                const x = Common.random(size, render.options.width - size);
                
                const block = Bodies.polygon(
                    x, 
                    -size, 
                    Math.round(Common.random(3, 8)), 
                    size,
                    {
                        friction: 1,
                        restitution: 0.1,
                        render: {
                            fillStyle: `hsl(${Common.random(0, 360)}, 80%, 60%)`
                        }
                    }
                );
                
                World.add(world, block);
            }
        }, 2000);
    },

    // ニュートンのゆりかご
    'newton-cradle': function() {
        resetWorld();
        
        // 地面
        const ground = Bodies.rectangle(render.options.width / 2, render.options.height, render.options.width, 50, { 
            isStatic: true,
            render: { fillStyle: '#888' }
        });
        
        // ニュートンのゆりかごを作成する関数
        const createCradle = function(xPos, yPos, number, size, length) {
            const cradle = Composite.create();
            
            for (let i = 0; i < number; i++) {
                const ball = Bodies.circle(
                    xPos + i * (size * 2), 
                    yPos + length, 
                    size, 
                    {
                        inertia: Infinity,  // 回転しないようにする
                        restitution: 1,     // 完全弾性衝突
                        friction: 0,        // 摩擦なし
                        frictionAir: 0.0001, // 空気抵抗は最小限に
                        slop: 1,            // 重なりの許容範囲
                        render: {
                            fillStyle: '#444'
                        }
                    }
                );
                
                const constraint = Constraint.create({
                    pointA: { x: xPos + i * (size * 2), y: yPos },
                    bodyB: ball,
                    length: length,
                    stiffness: 0.9,
                    render: {
                        strokeStyle: '#888',
                        lineWidth: 2
                    }
                });
                
                Composite.addBody(cradle, ball);
                Composite.addConstraint(cradle, constraint);
            }
            
            return cradle;
        };
        
        // 複数のゆりかごを異なるサイズで作成
        const cradle1 = createCradle(
            render.options.width * 0.25, 
            150, 
            5, 
            30, 
            200
        );
        
        const cradle2 = createCradle(
            render.options.width * 0.65, 
            250, 
            7, 
            20, 
            160
        );
        
        World.add(world, [ground, cradle1, cradle2]);
        
        // 定期的に新しい運動を追加
        const interval = setInterval(() => {
            if (currentDemo !== 'newton-cradle') {
                clearInterval(interval);
                return;
            }
            
            // ランダムに選んだボールに力を加える
            const cradle = Math.random() > 0.5 ? cradle1 : cradle2;
            const ballIndex = Math.floor(Math.random() * cradle.bodies.length);
            const ball = cradle.bodies[ballIndex];
            
            const forceMagnitude = 0.03;
            const forceX = (Math.random() > 0.5 ? 1 : -1) * forceMagnitude;
            
            Body.applyForce(ball, 
                { x: ball.position.x, y: ball.position.y },
                { x: forceX, y: -0.01 }
            );
        }, 10000);
    },
    
    // ラグドール
    ragdoll: function() {
        resetWorld();
        
        // 地面
        const ground = Bodies.rectangle(render.options.width / 2, render.options.height, render.options.width, 50, { 
            isStatic: true,
            render: { fillStyle: '#888' }
        });
        
        // ラグドールを作成する関数
        const createRagdoll = function(x, y, scale = 1) {
            const ragdoll = Composite.create();
            
            // 頭
            const head = Bodies.circle(x, y - 60 * scale, 30 * scale, {
                density: 0.001,
                friction: 0.8,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#FFBC42'
                }
            });
            
            // 胴体
            const torso = Bodies.rectangle(x, y, 40 * scale, 80 * scale, {
                density: 0.001,
                friction: 0.8,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#D81159'
                }
            });
            
            // 腕
            const rightUpperArm = Bodies.rectangle(x + 40 * scale, y - 20 * scale, 60 * scale, 20 * scale, {
                density: 0.0005,
                friction: 0.8,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#8F2D56'
                }
            });
            
            const rightLowerArm = Bodies.rectangle(x + 80 * scale, y - 20 * scale, 60 * scale, 15 * scale, {
                density: 0.0004,
                friction: 0.8,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#8F2D56'
                }
            });
            
            const leftUpperArm = Bodies.rectangle(x - 40 * scale, y - 20 * scale, 60 * scale, 20 * scale, {
                density: 0.0005,
                friction: 0.8,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#8F2D56'
                }
            });
            
            const leftLowerArm = Bodies.rectangle(x - 80 * scale, y - 20 * scale, 60 * scale, 15 * scale, {
                density: 0.0004,
                friction: 0.8,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#8F2D56'
                }
            });
            
            // 脚
            const rightUpperLeg = Bodies.rectangle(x + 20 * scale, y + 60 * scale, 20 * scale, 60 * scale, {
                density: 0.0006,
                friction: 0.8,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#218380'
                }
            });
            
            const rightLowerLeg = Bodies.rectangle(x + 20 * scale, y + 110 * scale, 18 * scale, 60 * scale, {
                density: 0.0005,
                friction: 0.8,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#218380'
                }
            });
            
            const leftUpperLeg = Bodies.rectangle(x - 20 * scale, y + 60 * scale, 20 * scale, 60 * scale, {
                density: 0.0006,
                friction: 0.8,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#218380'
                }
            });
            
            const leftLowerLeg = Bodies.rectangle(x - 20 * scale, y + 110 * scale, 18 * scale, 60 * scale, {
                density: 0.0005,
                friction: 0.8,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#218380'
                }
            });
            
            // 接続
            // 頭と胴体
            const neckConstraint = Constraint.create({
                bodyA: head,
                bodyB: torso,
                pointA: { x: 0, y: 25 * scale },
                pointB: { x: 0, y: -35 * scale },
                stiffness: 0.8,
                render: {
                    visible: false
                }
            });
            
            // 上腕と胴体
            const rightShoulderConstraint = Constraint.create({
                bodyA: torso,
                bodyB: rightUpperArm,
                pointA: { x: 20 * scale, y: -30 * scale },
                pointB: { x: -25 * scale, y: 0 },
                stiffness: 0.8,
                render: {
                    visible: false
                }
            });
            
            const leftShoulderConstraint = Constraint.create({
                bodyA: torso,
                bodyB: leftUpperArm,
                pointA: { x: -20 * scale, y: -30 * scale },
                pointB: { x: 25 * scale, y: 0 },
                stiffness: 0.8,
                render: {
                    visible: false
                }
            });
            
            // 肘
            const rightElbowConstraint = Constraint.create({
                bodyA: rightUpperArm,
                bodyB: rightLowerArm,
                pointA: { x: 25 * scale, y: 0 },
                pointB: { x: -20 * scale, y: 0 },
                stiffness: 0.8,
                render: {
                    visible: false
                }
            });
            
            const leftElbowConstraint = Constraint.create({
                bodyA: leftUpperArm,
                bodyB: leftLowerArm,
                pointA: { x: -25 * scale, y: 0 },
                pointB: { x: 20 * scale, y: 0 },
                stiffness: 0.8,
                render: {
                    visible: false
                }
            });
            
            // 股関節
            const rightHipConstraint = Constraint.create({
                bodyA: torso,
                bodyB: rightUpperLeg,
                pointA: { x: 15 * scale, y: 35 * scale },
                pointB: { x: 0, y: -25 * scale },
                stiffness: 0.8,
                render: {
                    visible: false
                }
            });
            
            const leftHipConstraint = Constraint.create({
                bodyA: torso,
                bodyB: leftUpperLeg,
                pointA: { x: -15 * scale, y: 35 * scale },
                pointB: { x: 0, y: -25 * scale },
                stiffness: 0.8,
                render: {
                    visible: false
                }
            });
            
            // 膝
            const rightKneeConstraint = Constraint.create({
                bodyA: rightUpperLeg,
                bodyB: rightLowerLeg,
                pointA: { x: 0, y: 25 * scale },
                pointB: { x: 0, y: -25 * scale },
                stiffness: 0.8,
                render: {
                    visible: false
                }
            });
            
            const leftKneeConstraint = Constraint.create({
                bodyA: leftUpperLeg,
                bodyB: leftLowerLeg,
                pointA: { x: 0, y: 25 * scale },
                pointB: { x: 0, y: -25 * scale },
                stiffness: 0.8,
                render: {
                    visible: false
                }
            });
            
            // ラグドールのパーツをコンポジットに追加
            Composite.addBody(ragdoll, head);
            Composite.addBody(ragdoll, torso);
            Composite.addBody(ragdoll, rightUpperArm);
            Composite.addBody(ragdoll, rightLowerArm);
            Composite.addBody(ragdoll, leftUpperArm);
            Composite.addBody(ragdoll, leftLowerArm);
            Composite.addBody(ragdoll, rightUpperLeg);
            Composite.addBody(ragdoll, rightLowerLeg);
            Composite.addBody(ragdoll, leftUpperLeg);
            Composite.addBody(ragdoll, leftLowerLeg);
            
            // 接続を追加
            Composite.addConstraint(ragdoll, neckConstraint);
            Composite.addConstraint(ragdoll, rightShoulderConstraint);
            Composite.addConstraint(ragdoll, leftShoulderConstraint);
            Composite.addConstraint(ragdoll, rightElbowConstraint);
            Composite.addConstraint(ragdoll, leftElbowConstraint);
            Composite.addConstraint(ragdoll, rightHipConstraint);
            Composite.addConstraint(ragdoll, leftHipConstraint);
            Composite.addConstraint(ragdoll, rightKneeConstraint);
            Composite.addConstraint(ragdoll, leftKneeConstraint);
            
            return ragdoll;
        };
        
        // いくつかのラグドールを作成
        const ragdoll1 = createRagdoll(render.options.width * 0.25, 100, 0.8);
        const ragdoll2 = createRagdoll(render.options.width * 0.5, 50, 1);
        const ragdoll3 = createRagdoll(render.options.width * 0.75, 150, 0.6);
        
        World.add(world, [ground, ragdoll1, ragdoll2, ragdoll3]);
        
        // クリックでラグドールを追加
        Events.on(mouseConstraint, 'mousedown', function(event) {
            if (currentDemo === 'ragdoll') {
                // マウス位置に小さなラグドールを追加
                const mousePos = event.mouse.position;
                
                // 既存のラグドールが多すぎる場合は追加しない
                const bodies = Composite.allBodies(world);
                if (bodies.length < 100) {
                    const scale = Math.random() * 0.4 + 0.3;  // 0.3〜0.7のランダムなスケール
                    const newRagdoll = createRagdoll(mousePos.x, mousePos.y, scale);
                    World.add(world, newRagdoll);
                }
            }
        });
        
        // 定期的にランダムな力を加える
        const interval = setInterval(() => {
            if (currentDemo !== 'ragdoll') {
                clearInterval(interval);
                return;
            }
        }, 500);
    }
};

// ボタンイベントリスナーを設定
document.querySelectorAll('.sidebar button').forEach(button => {
    button.addEventListener('click', function() {
        const demoId = this.id;
        if (demos[demoId]) {
            currentDemo = demoId;
            demos[demoId]();
        }
    });
});

// 初期デモを開始
document.getElementById('basic').click(); 