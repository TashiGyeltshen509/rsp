module rps::rock_paper_scissors;

use std::hash;
use sui::object::{Self, UID};
use sui::tx_context::{Self, TxContext};
use sui::coin::{Self, Coin};
use sui::sui::SUI;

struct Game has key {
    id: UID,
    player1: address,
    player2: address,
    bet: u64,
    player1_commit: vector<u8>, // hash of choice+secret
    player2_commit: vector<u8>, // hash of choice+secret
    player1_choice: u8, // revealed later: 0=rock,1=paper,2=scissors
    player2_choice: u8,
    finished: bool,
}

public fun create_game(
    player2: address,
    bet: u64,
    ctx: &mut TxContext
): Game {
    Game {
        id: object::new(ctx),
        player1: tx_context::sender(ctx),
        player2,
        bet,
        player1_commit: b"",
        player2_commit: b"",
        player1_choice: 255, // not revealed
        player2_choice: 255,
        finished: false,
    }
}

public fun commit_choice(game: &mut Game, commit: vector<u8>, ctx: &TxContext) {
    let sender = tx_context::sender(ctx);
    if (sender == game.player1) {
        game.player1_commit = commit;
    } else if (sender == game.player2) {
        game.player2_commit = commit;
    } else {
        abort 1; // not part of game
    }
}

public fun reveal_choice(game: &mut Game, choice: u8, secret: vector<u8>, ctx: &TxContext) {
    let sender = tx_context::sender(ctx);
    let mut data = vector::empty<u8>();
    vector::push_back(&mut data, choice);
    vector::append(&mut data, secret);

    let hash_val = hash::sha3_256(&data);

    if (sender == game.player1) {
        assert!(hash_val == game.player1_commit, 2);
        game.player1_choice = choice;
    } else if (sender == game.player2) {
        assert!(hash_val == game.player2_commit, 3);
        game.player2_choice = choice;
    } else {
        abort 4;
    }
}

public fun settle(
    game: &mut Game,
    mut p1_coin: Coin<SUI>,
    mut p2_coin: Coin<SUI>,
    ctx: &mut TxContext
) {
    assert!(!game.finished, 5);

    // ensure both revealed
    assert!(game.player1_choice <= 2, 6);
    assert!(game.player2_choice <= 2, 7);

    let outcome = winner(game.player1_choice, game.player2_choice);

    if (outcome == 0) {
        // draw → refund both
        coin::transfer(&mut p1_coin, game.player1);
        coin::transfer(&mut p2_coin, game.player2);
    } else if (outcome == 1) {
        // player1 wins
        let total = coin::merge(&mut p1_coin, p2_coin);
        coin::transfer(&total, game.player1);
    } else {
        // player2 wins
        let total = coin::merge(&mut p2_coin, p1_coin);
        coin::transfer(&total, game.player2);
    };

    game.finished = true;
}

fun winner(choice1: u8, choice2: u8): u8 {
    if (choice1 == choice2) return 0; // draw
    if ((choice1 == 0 && choice2 == 2) ||
        (choice1 == 1 && choice2 == 0) ||
        (choice1 == 2 && choice2 == 1)) {
        return 1; // player1 wins
    };
    2 // player2 wins
}
