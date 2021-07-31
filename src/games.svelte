<script>
    import Minesweeper from "./minesweeper.svelte"
</script>

<div class="main">
    <Minesweeper/>
</div>

<style>
    .main{
        text-align: left;
        font-family: 'Josefin Sans', sans-serif;
    }


    @media (max-width:950px){
        .main{
            display: none;
        }
    }
</style>