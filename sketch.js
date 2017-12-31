food = [];
fish = [];
population = [];
poison = [];
speed = 1;
back = [];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  for (var i = 0; i < height * width / 10000; i++) {
    food.push(new Food(random(width), random(height)));
  }

  for (var i = 0; i < width * height / 50000; i++) {
    poison.push(new Poison(random(width), random(height)));
  }

  for (var i = 0; i < width * height / 40000; i++) {
    fish.push(new Fish(random(-180, 180), random(width), random(height)));
  }
  popu = new Population();
  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);
  best = 0;
  fishGen = 0;
}

function draw() {
  background(0, 170, 220);
  currentBest = 0;
  for (var i = fish.length - 1; i > 0; i--) {
    if (fish[i].hp > 0) {
      if (fish[i].fit > currentBest) {
        if (fish[i].fit > best) {
          best = fish[i].fit;
        }
        currentBest = fish[i].fit;
        currentBestnum = i;
      }
      for (var j = 0; j < speed; j++) {
        fish[i].update();
      }
    } else {
      fish.splice(i, 1);
      fish.push(new Fish(random(-180, 180), random(width), random(height), popu.cross()));
      fishGen++;
    }
  }
  for (var i = fish.length - 1; i > 0; i--) {
    if (i === currentBestnum) {
      fill(255, 255, 0, 150)
      ellipse(fish[i].x, fish[i].y, 50, 50)
    }
    fish[i].show();
  }
  for (var i = 0; i < food.length; i++) {
    food[i].show();
  }

  for (var i = 0; i < poison.length; i++) {
    poison[i].show();
  }
  population = [];

  for (var i = 0; i < fish.length; i++) {
    for (var j = 0; j < fish[i].fit; j++) {
      population.push(fish[i]);
    }
  }
  fill(0);
  textSize(20);
  text("best: " + best + "\ncurrent best: " + currentBest + "\n-----------------------\ntotal fish generated: " + fishGen, 0, 25);

}

function Food(x, y) {
  this.x = x;
  this.y = y;

  this.show = function() {
    noStroke();
    fill(0, 255, 0)
    ellipse(this.x, this.y, 5);
  }
}

function Poison(x, y) {
  this.x = x;
  this.y = y;

  this.show = function() {
    noStroke();
    fill(255, 0, 0)
    ellipse(this.x, this.y, 5);
  }
}

function Fish(r, x, y, wages) {
  this.x = x;
  this.y = y;
  this.hp = 1;
  this.fit = 1;
  this.r = r;

  this.input = [0, 0, 0, 0, 0, 0, 0, 0];
  this.hidden = [0, 0, 0, 0];
  this.output = [0, 0];
  this.wages = [];
  this.img = loadImage("VIS.png");

  if (wages) {
    this.wages = wages;
    for (var i = 0; i < wages.length; i++) {
      if (random(1) < 0.001) {
        this.wages[i] += random(-0.1, 0.1)
      }
    }
  } else {
    for (var i = 0; i < (this.input.length * this.hidden.length); i++) {
      this.wages.push(random(-1, 1));
    }
    for (var i = 0; i < (this.hidden.length * this.output.length); i++) {
      this.wages.push(random(-1, 1));
    }
  }

  this.sigmoid = function(x) {
    return 1 / (1 + Math.pow(Math.E, -x));
  }


  this.update = function() {


    for (var i = food.length - 1; i > 0; i--) {
      if (dist(food[i].x, food[i].y, this.x, this.y) < 100) {
        var a = atan2(this.y - food[i].y, this.x - food[i].x) - this.r; //get the degree from the food in degree (from -180 to 180)
        if (a > 180) {
          a -= 360;
        }
        if (a < -180) {
          a += 360;
        }
        if (dist(food[i].x, food[i].y, this.x, this.y) < 15) {
          this.hp += 0.2;
          this.fit += 1;
          food.splice(i, 1);
          food.push(new Food(random(width), random(height)));
        }
        if (a < -90 || a > 90) {
          if (a < -135) {
            this.input[2] += 0.1
          } else if (a < -90) {
            this.input[3] += 0.1
          } else if (a > 135) {
            this.input[1] += 0.1
          } else {
            this.input[0] += 0.1
          }
        }
      }
    }

    for (var i = poison.length - 1; i > 0; i--) {
      if (dist(poison[i].x, poison[i].y, this.x, this.y) < 100) {
        var a = atan2(this.y - poison[i].y, this.x - poison[i].x) - this.r; //get the degree from the food in degree (from -180 to 180)
        if (a > 180) {
          a -= 360;
        }
        if (a < -180) {
          a += 360;
        }
        if (dist(poison[i].x, poison[i].y, this.x, this.y) < 15) {
          this.hp -= 0.2;
          this.fit -= 0.5;
          poison.splice(i, 1);
          poison.push(new Poison(random(width), random(height)));
        }
        if (a < -90 || a > 90) {
          if (a < -135) {
            this.input[6] += 0.1
          } else if (a < -90) {
            this.input[7] += 0.1
          } else if (a > 135) {
            this.input[5] += 0.1
          } else {
            this.input[4] += 0.1
          }
        }
      }
    }

    this.hp -= 0.0025;

    for (var i = 0; i < this.hidden.length; i++) {
      var average = 0;
      for (var j = 0; j < this.input.length; j++) {
        average += this.input[j] * this.wages[j + i * this.input.length];
      }
      this.hidden[i] = this.sigmoid(average);
    }
    this.input = [0, 0, 0, 0, 0, 0, 0, 0];

    for (var i = 0; i < this.output.length; i++) {
      var average = 0;
      for (var j = 0; j < this.hidden.length; j++) {
        average += this.hidden[j] * this.wages[(j + i * this.hidden.length) + (this.input.length * this.hidden.length)];
      }
      this.output[i] = this.sigmoid(average);
    }
    this.hidden = [0, 0, 0, 0];

    this.r += 20 * (this.output[0] - 0.5);
    if (this.r > 180) {
      this.r -= 360;
    }
    if (this.r < 180) {
      this.r += 360;
    }
    this.x += 2 * this.output[1] * cos(this.r);
    this.y += 2 * this.output[1] * sin(this.r);
    if (this.x > width) {
      this.x = 0;
    }
    if (this.x < 0) {
      this.x = width;
    }

    if (this.y > height) {
      this.y = 0;
    }
    if (this.y < 0) {
      this.y = height;
    }

  }
  this.show = function() {
    push();
    translate(this.x, this.y);
    rotate(this.r);
    stroke(255);

    // line(0, 0, 100 * cos(90), 100 * sin(90)); //this piece is just for debugging and shows what the fish can see
    // line(0, 0, 100 * cos(270), 100 * sin(270));
    // line(0, 0, 100 * cos(45), 100 * sin(45));
    // line(0, 0, 100 * cos(315), 100 * sin(315));
    // line(0, 0, 100 * cos(0), 100 * sin(0));

    noStroke();
    fill(lerpColor(color(255, 0, 0), color(0, 255, 0), this.hp));
    image(this.img, 0, 0, 25, 20);
    //rect(-20, 0, 35, 20);
    pop();

  }
}

function Population() {
  this.cross = function() {
    var newWages = [];
    var ParentA = random(population)
    var ParentB = random(population)
    var mid = random(ParentA.wages)
    for (var i = 0; i < ParentA.wages.length; i++) {
      if (i < mid) {
        newWages.push(ParentA.wages[i]);
      } else {
        newWages.push(ParentB.wages[i]);
      }
    }
    return newWages
  }

}
