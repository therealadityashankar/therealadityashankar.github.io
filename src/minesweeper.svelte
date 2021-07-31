<script>
import minesweeper from "./minesweeper";
let mineArray = minesweeper.generateMineArray({rows: 5, cols: 5, mines: 7});
let board = new minesweeper.Board(mineArray);

let gridRows = board.grid()
let state = board.state()

const getCellClasses = cell => {
    if(cell.state == minesweeper.CellStateEnum.CLOSED) return "hidden";
    else{
        let text = "open"
        return text
    }
}

const checkSetWin = () => {
    let numClosed = 0;

    for(let row of gridRows){
        for(let cell of row){
            if (cell.state == minesweeper.CellStateEnum.CLOSED) numClosed += 1;
        }
    }

    // if only 7 remain, then the user has won, but the minesweeper.js code is faulty, so we've to
    // mark everything as "flagged" in order to show the user has won
    if (numClosed == 7){
        for(let row of gridRows){
            for(let cell of row){
                if (cell.state == minesweeper.CellStateEnum.CLOSED){
                    while(cell.flag != minesweeper.CellFlagEnum.EXCLAMATION){
                        board.cycleCellFlag(cell.x, cell.y)
                    }
                }
            }
        }
    }
}

const clickCell = cell => {
    const prevState = board.state()
    board.openCell(cell.x, cell.y)

    // ensure that nobody can ever lose the game on the first click
    if(prevState == minesweeper.BoardStateEnum.PRISTINE && board.state() == minesweeper.BoardStateEnum.LOST){
        mineArray = minesweeper.generateMineArray({rows: 5, cols: 5, mines: 7});
        board = new minesweeper.Board(mineArray);
        gridRows = board.grid()
        clickCell(gridRows[cell.y][cell.x])
        return;
    }
    gridRows = gridRows;
    checkSetWin()
    state = board.state();
}

const getCellText = cell => {
    if(board.state() == minesweeper.BoardStateEnum.LOST && cell.isMine) return "💥";

    if(cell.flag != minesweeper.CellFlagEnum.NONE){
        if(cell.flag == minesweeper.CellFlagEnum.EXCLAMATION) return "!"
        else return "?"
    } 
    if(cell.state == minesweeper.CellStateEnum.CLOSED) return "";

    if(cell.isMine) return "💥";
    else if(cell.numAdjacentMines > 0) return cell.numAdjacentMines;
    if(cell.numAdjacentMines == 0) return ""
}

const toggleMineFlag = cell => {
    board.cycleCellFlag(cell.x, cell.y)
    gridRows = gridRows;
}

const rematch = () => {
    mineArray = minesweeper.generateMineArray({rows: 5, cols: 5, mines: 7});
    board = new minesweeper.Board(mineArray);
    gridRows = board.grid()
    state = board.state()
}

</script>

<div class="minesweeper">
    <div class="board">
        {#each gridRows as row}
            <div class="row">
                {#each row as cell}
                    <div class="cell {getCellClasses(cell)}" on:click={clickCell(cell)} on:contextmenu|preventDefault={toggleMineFlag(cell)}>{getCellText(cell)}</div>
                {/each}
            </div>
        {/each}
    </div>
    <div class="text">
        {#if state == minesweeper.BoardStateEnum.PRISTINE || state == minesweeper.BoardStateEnum.IN_PROGRESS}
            MINESWEEPER
        {:else if state == minesweeper.BoardStateEnum.WON}
            🎉🎉🎉 YOU WIN<br><input class="rematch" type="button" value="play again?" on:click={rematch}>
        {:else}
            YOU LOSE <input class="rematch" type="button" value="try again?" on:click={rematch}>
        {/if}
        <br><span class="mines-remaining">7 MINES</span><br><a class="by" href="https://github.com/binaryluke/Minesweeper" target="_blank">Minesweeper code by binaryluke</a>
    </div>
    <div class="back back-1"></div>
</div>

<style>
    .minesweeper{
        text-align: left;
        font-size: 0;
        width: max-content;
        position: relative;
        color: white;
    }

    .text{
        font-size: 1rem;
        margin-left: 5px;
        margin-top: 10px;
        padding-bottom: 5px;
    }

    .by{
        display:inline-block;
        margin-top: 10px;
        font-size: 0.65rem;
        color: white;
        text-decoration: underline;
    }

    .mines-remaining{
        font-size: 0.7rem;
        border-bottom: 3px solid olive;
    }
    
    .cell{
        margin: 5px;
        background:orange;
        width: 25px;
        height: 25px;
        line-height: 25px;
        display : inline-block;
        cursor: pointer;
        transition: all 1s;
        font-size: 1rem;
        text-align: center;
        vertical-align: middle;
        color: black;
    }

    .cell.open{
        background: #95ccb9;
    }

    .cell.open:hover{
        border-radius: 0;
        background: #95ccb9;
    }
    
    .cell:hover{
        border-radius: 50px;
        background: red;
    }
    
    .back{
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background:#4300fb;
        z-index: -1;
        clip-path: polygon(0.54% 9.04%, 100% 2px, 100% 100%, 1px 100%);
    }

    .rematch{
        border: none;
        padding: 0;
        background: transparent;
        color: white;
        text-decoration: underline;
        cursor:pointer;
        margin: 0;
    }
</style>