---
title: Causality
description: Automate cause and effect relationships between tokens
author: Robert Tate
image: https://raw.githubusercontent.com/RobertTate/causality/main/docs/CausalityMenuExample.png
icon: https://causality-gold.vercel.app/icon-alt.svg
tags:
  - automation
manifest: https://causality-gold.vercel.app/manifest.json
learn-more: https://github.com/RobertTate/causality
---

# Causality

### An an [Owlbear Rodeo](https://www.owlbear.rodeo/) extension for automating what happens next.

**Causality** lets Game Masters link **causes** and **effects** between tokens — so hidden traps spring, doors open, or any other domino effect happens automatically.

<img src="https://raw.githubusercontent.com/RobertTate/causality/main/docs/ShortCausalityDemo.gif" alt="Short Causality Demo" width="722">

## Features

- ⚡ Drag-and-drop interface for defining _Cause ➜ Effect_ chains
- 🖇️ Combine multiple causes with `AND` / `OR` logic
- 🔄 Chain causalities together for Rube-Goldberg moments
- 🖱️ Dedicated **Causality Move Tool** so collisions can fire while you drag

## How to use:

### Step 1:

**Add tokens to Causality.**

<img src="https://raw.githubusercontent.com/RobertTate/causality/main/docs/Step1AddTokens.gif" alt="Short Causality Demo" width="722">

### Step 2:

**Set one or more tokens as a "Cause"**

A **causality** can have more than one cause. All or some (depending on whether they have AND or OR relationships) **cause** conditions must be met before a **causality** triggers.

<img src="https://raw.githubusercontent.com/RobertTate/causality/main/docs/Step2AddCause.gif" alt="Short Causality Demo" width="722">

### Step 3:

**Pair one or more tokens as an "Effect" to the "Cause(s)"**

<img src="https://raw.githubusercontent.com/RobertTate/causality/main/docs/Step3AddEffects.gif" alt="Short Causality Demo" width="722">

### Step 4 (optional):

**Chain more Causalities together!**

<img src="https://raw.githubusercontent.com/RobertTate/causality/main/docs/Step4TriggerOrChain.gif" alt="Short Causality Demo" width="722">

### Step 5:

**Trigger the causality (or causalities). Reset them to start over.**

<img src="https://raw.githubusercontent.com/RobertTate/causality/main/docs/Step5Trigger.gif" alt="Short Causality Demo" width="722">

<hr />

**IMPORTANT**: If you want a collision to trigger **while** you're moving a token, you must be using the **Causality Move Tool**.

<img src="https://raw.githubusercontent.com/RobertTate/causality/main/docs/CausalityMoveTool.png" alt="Short Causality Demo" width="175">

## Collision modes explained

- There are both **"Is Collided Into"** and **"Is Covered"** **cause** conditions. When only using one **cause** in a **causality**, they appear to behave the same. However, if you are using multiple **causes** - the difference becomes more clear:

### "Is Collided Into"

- If you have two **causes** in a **causality** with an **AND** relationship and they are both using this trigger type, a token can bump into one, move away from it, then bump into the other, and the causality will trigger.

_Example: An adventurer finds and pulls levers as they traverse a dungeon. As they reach and pull the final lever, a hidden passage is revealed._

### "Is Covered"

- If you have two Causes in a causality with an AND relationship and they are both using this trigger type, a token must stay over each before the causality triggers.

_Example: Two adventurers must each stay standing on a pressure plate, before a hidden passage is finally revealed._

## FAQ

**Collisions don’t fire while I drag a token**

- Make sure you’ve selected the **Causality Move Tool** (you can hit C on your keyboard as a shortcut to get to it). Collisions only update during movement when this tool is in use.

**My token still isn't triggering a collision**

- Even if that token isn't connected to a cause or effect, it must still first be added to Causality before it can be used to trigger collisions.

<br />

> ⚡⚡⚡⚡
>
> Thanks for checking out **Causality**! I made this because I wanted a way for hidden traps to appear automatically if one of my players moved their token into it. And then down the rabbit hole I went. Now we have this. 🙃
>
> ⚡⚡⚡⚡
