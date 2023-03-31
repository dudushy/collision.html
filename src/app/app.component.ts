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

  gameSetup = false;
  gameLevel = this.db.get('gameLevel') || 1;

  killCounter = this.db.get('killCounter') || 0;

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

      console.log(`[${this.title}#window.onload] gameSetup`, this.gameSetup);
      if (this.gameSetup) return;

      this.setupGame();
    };
  }

  updateView(from: string) {
    console.log(`[${this.title}#updateView] from`, from);
    this.cdr.detectChanges;
  }

  setupGame() {
    console.log(`[${this.title}#setupGame]`);

    // this.setupXhair(); //!DEBUG
    // this.spawnTargets();
    // this.moveTargets();

    this.gameSetup = true;
    console.log(`[${this.title}#setupGame] gameSetup`, this.gameSetup);
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

  killAllTargets() {
    console.log(`[${this.title}#killAllTargets]`);

    const targets = document.getElementsByClassName('target') as HTMLCollectionOf<HTMLImageElement>;
    console.log(`[${this.title}#killAllTargets] targets`, targets);

    for (const [key, value] of Object.entries(targets)) {
      console.log(`[${this.title}#killAllTargets] key:`, key, '| value:', value);

      value.remove();
    }

    this.killCounter = 0;
    this.gameLevel = 1;

    this.db.set('killCounter', this.killCounter);
    console.log(`[${this.title}#killAllTargets] killCounter`, this.killCounter);

    this.db.set('gameLevel', this.gameLevel);
    console.log(`[${this.title}#killAllTargets] gameLevel`, this.gameLevel);

    this.updateView(this.title);
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

    this.updateView(this.title);
  }

  moveTargets() {
    const targets = document.getElementsByClassName('target') as HTMLCollectionOf<HTMLImageElement>;
    console.log(`[${this.title}#moveTargets] targets`, targets);

    for (const [key, value] of Object.entries(targets)) {
      console.log(`[${this.title}#moveTargets] key:`, key, '| value:', value);

      const amount = this.gameLevel * 13;
      console.log(`[${this.title}#moveTargets] amount`, amount);

      const Ypos = parseInt(value.style.top.replace('px', '')) || 1;
      // const Ypos = value.offsetHeight;
      console.log(`[${this.title}#moveTargets] Ypos`, Ypos);

      value.style.top = `${Ypos + amount}px`;

      this.updateView(this.title);
    }

    const timeout = this.gameLevel * 1000 / 2;

    setTimeout(() => {
      if (targets.length == 0) return;
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
    newTarget.style.padding = '1%';
    newTarget.style.borderRadius = '50%';
    newTarget.style.backgroundColor = '#eb445a';
    newTarget.style.zIndex = '1';
    newTarget.style.transition = '250ms all';
    newTarget.style.userSelect = 'none';
    newTarget.setAttribute('draggable', 'false');

    newTarget.id = `target${targets?.children.length}`;
    newTarget.onclick = () => {
      this.killTarget(newTarget.id);
    };

    console.log(`[${this.title}#spawnTargets] newTarget`, newTarget);
    targets?.appendChild(newTarget);

    setTimeout(() => {
      if (targets?.children.length == 0) return;
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
