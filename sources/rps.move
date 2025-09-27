module rps::rock_paper_scissors;

use sui::{
    random::Random,
    event,
};

/// Struct to store game result
public struct GameResult has copy, drop, store {
    player: address,
    player_choice: u8,
    opponent_choice: u8,
    outcome: u8,
}
const INVALID_CHOICE: u64 = 1;
const DRAW: u8 = 0;
const WIN: u8 = 1;
const LOSS: u8 = 2;

// === Public-Mutative Functions ===

/// Play a game of Rock-Paper-Scissors
entry fun play(
    random: &Random,
    player_choice: u8,
    ctx: &mut TxContext
) {
    assert!(player_choice >= 1 && player_choice <= 3, INVALID_CHOICE);

    let opponent_choice = generate_choice(random, ctx);
    let outcome = determine_outcome(player_choice, opponent_choice);
    let player = ctx.sender();

    event::emit(GameResult {
        player,
        player_choice,
        opponent_choice,
        outcome,
    });
}

// === Private Functions ===

/// Generate the opponent's random choice (1: Rock, 2: Paper, 3: Scissors)
fun generate_choice(random: &Random, ctx: &mut TxContext): u8 {
    let mut gen = random.new_generator(ctx);
    (gen.generate_u64() % 3 + 1) as u8
}

/// Determine the outcome of the game
fun determine_outcome(player_choice: u8, opponent_choice: u8): u8 {
    // Determine outcome
    if (player_choice == opponent_choice) {
        DRAW
    } else if (
            (player_choice == 1 && opponent_choice == 3) || // Rock beats Scissors
            (player_choice == 2 && opponent_choice == 1) || // Paper beats Rock
            (player_choice == 3 && opponent_choice == 2)    // Scissors beats Paper
    ) {
        WIN
    } else {
        LOSS
    }
}