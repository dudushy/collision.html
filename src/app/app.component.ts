/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ChangeDetectorRef } from '@angular/core';

import { DbService } from './services/db/db.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'AppComponent';

  window = window;

  theme = 'dark';
  mobileMode = false;

  gameRunning = false;
  gameLevel = this.db.get('gameLevel') || 1;

  nextTargetId = 0;

  killCounter = this.db.get('killCounter') || 0;
  coinCounter = this.db.get('coinCounter') || 0;

  constructor(
    public db: DbService,
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    console.log(`[${this.title}#constructor]`);

    this.redirectTo(this.db.get('last_page') || '', this.title);

    this.theme = this.db.get('theme') || 'dark';
    this.toggleTheme(this.theme);

    this.toggleMobileMode();

    this.window.onresize = () => {
      console.log(`[${this.title}#window.onresize]`);

      this.toggleMobileMode();
    };

    this.window.onload = () => {
      console.log(`[${this.title}#window.onload]`);

      console.log(`[${this.title}#window.onload] gameRunning`, this.gameRunning);
      if (this.gameRunning) return;

      // this.startGame();
    };
  }

  updateView(from: string) {
    console.log(`[${this.title}#updateView] from`, from);
    this.cdr.detectChanges;
  }

  startGame() {
    console.log(`[${this.title}#startGame] (BEFORE) gameRunning`, this.gameRunning);

    if (this.gameRunning) return;

    // this.setupXhair(); //!DEBUG
    this.spawnTargets();
    this.moveTargets();

    this.gameRunning = true;

    console.log(`[${this.title}#startGame] (AFTER) gameRunning`, this.gameRunning);

    this.updateView(this.title);
  }

  endGame() {
    console.log(`[${this.title}#endGame] (BEFORE) gameRunning`, this.gameRunning);

    if (!this.gameRunning) return;

    const targets = document.getElementsByClassName('target') as HTMLCollectionOf<HTMLImageElement>;
    console.log(`[${this.title}#endGame] targets`, targets);

    for (const [key, value] of Object.entries(targets)) {
      console.log(`[${this.title}#endGame] key:`, key, '| value:', value);

      value.remove();
    }

    this.gameLevel = 1;
    this.db.set('gameLevel', this.gameLevel);
    console.log(`[${this.title}#endGame] gameLevel`, this.gameLevel);

    this.killCounter = 0;
    this.db.set('killCounter', this.killCounter);
    console.log(`[${this.title}#endGame] killCounter`, this.killCounter);

    this.coinCounter = 0;
    this.db.set('coinCounter', this.coinCounter);
    console.log(`[${this.title}#endGame] coinCounter`, this.coinCounter);

    this.gameRunning = false;

    console.log(`[${this.title}#endGame] (AFTER) gameRunning`, this.gameRunning);

    this.updateView(this.title);
  }

  setupXhair() {
    const moveXhair = (event: any) => {
      console.log(`[${this.title}#setupXhair/moveXhair] event`, event);

      const xhair = document.getElementById('xhair') as HTMLDivElement;
      console.log(`[${this.title}#setupXhair/moveXhair] xhair`, xhair);

      const Xpos = `${event.offsetX - ((xhair.children[0] as HTMLImageElement).offsetWidth / 2)}px`;
      console.log(`[${this.title}#setupXhair/moveXhair] Xpos`, Xpos);

      const Ypos = `${event.offsetY - ((xhair.children[0] as HTMLImageElement).offsetHeight / 2)}px`;
      console.log(`[${this.title}#setupXhair/moveXhair] Ypos`, Ypos);

      if (Xpos.includes('-') || Ypos.includes('-')) return;
      xhair.style.left = Xpos;
      xhair.style.top = Ypos;
      // xhair.style.transition = '1ms all';

      // this.updateView(this.title);
    };

    const game = document.getElementById('game');
    console.log(`[${this.title}#setupXhair] game`, game);
    game?.addEventListener('mousemove', moveXhair);
  }

  killTarget(id: string) {
    console.log(`[${this.title}#killTarget] id`, id);

    const target = document.getElementById(id);
    console.log(`[${this.title}#killTarget] target`, target);
    target?.remove();

    this.killCounter++;
    this.db.set('killCounter', this.killCounter);
    console.log(`[${this.title}#killTarget] killCounter`, this.killCounter);

    if ((this.killCounter / 5) > this.gameLevel) {
      this.gameLevel++;
      this.db.set('gameLevel', this.gameLevel);
      console.log(`[${this.title}#killTarget] gameLevel`, this.gameLevel);
    }
  }

  moveTargets() {
    const timeout = 1000 * (1 / this.gameLevel);
    console.log(`[${this.title}#moveTargets] timeout`, timeout);

    const targets = document.getElementsByClassName('target') as HTMLCollectionOf<HTMLImageElement>;
    console.log(`[${this.title}#moveTargets] targets`, targets);

    for (const [key, value] of Object.entries(targets)) {
      console.log(`[${this.title}#moveTargets] key:`, key, '| value:', value);

      const amount = 10 * (1 / this.gameLevel);
      console.log(`[${this.title}#moveTargets] amount`, amount);

      const Ypos = parseInt(value.style.top.replace('px', '')) || 1;
      // const Ypos = value.offsetHeight;
      console.log(`[${this.title}#moveTargets] Ypos`, Ypos);

      value.style.top = `${Ypos + amount}px`;
    }

    setTimeout(() => {
      if (!this.gameRunning) return;
      this.moveTargets();
    }, timeout);
  }

  spawnTargets() {
    const timeout = this.gameLevel * 1000;
    console.log(`[${this.title}#spawnTargets] timeout`, timeout);

    const targets = document.getElementById('targets');
    console.log(`[${this.title}#spawnTargets] targets`, targets);

    const newTarget = document.createElement('img');
    newTarget.src = 'assets/SVGs/target0.svg';
    newTarget.className = 'target';
    newTarget.alt = 'target';

    newTarget.style.position = 'absolute';
    newTarget.style.height = '2vmax';
    newTarget.style.width = '2vmax';
    // newTarget.style.left = Math.floor(Math.random() * 91) + '%';
    newTarget.style.left = (Math.random() * (91.5 - 0) + 0) + '%';
    // newTarget.style.left = '91%';
    newTarget.style.padding = '1%';
    newTarget.style.borderRadius = '50%';
    newTarget.style.backgroundColor = '#eb445a';
    newTarget.style.zIndex = '1';
    newTarget.style.transition = '250ms all';
    newTarget.style.userSelect = 'none';
    newTarget.setAttribute('draggable', 'false');

    newTarget.id = `target${this.nextTargetId++}`;
    newTarget.onclick = () => {
      this.killTarget(newTarget.id);
    };

    console.log(`[${this.title}#spawnTargets] newTarget`, newTarget);
    targets?.appendChild(newTarget);

    setTimeout(() => {
      if (!this.gameRunning) return;
      this.spawnTargets();
    }, timeout);
  }

  redirectTo(url: any, from: any) {
    console.log(`[${this.title}#redirectTo] ${from} | url`, url);

    this.router.navigateByUrl(`/${url}`);

    this.db.set('last_page', url);
    console.log(`[${this.title}#redirectTo] last_page`, this.db.get('last_page'));

    this.updateView(this.title);
  }

  toggleTheme(theme: any) {
    console.log(`[${this.title}#toggleTheme] theme`, theme);

    this.theme = theme;

    document.body.setAttribute('theme', theme);

    this.updateView(this.title);
  }

  toggleMobileMode() {
    const width = window.innerWidth;
    const condition = width < 900;
    console.log(`[${this.title}#toggleMobileMode] width`, width, condition);

    if (condition) {
      this.mobileMode = true;
    } else {
      this.mobileMode = false;
    }

    this.updateView(this.title);
  }
}
