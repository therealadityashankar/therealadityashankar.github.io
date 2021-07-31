<div id="certifications">
    <h1>Certifications</h1>
    <div class="certifications">
        <div class="certificate">
            <div  class="by">
                <img src="./udacityLogo.png" alt="udacity logo" height=75>
            </div>
            <div class="content">
                <h2>Full Stack Web Developer Nanodegree</h2>
                <p class="from">from Udacity</p>
                <p class="proof-of-completion">confirmation : <a href="https://confirm.udacity.com/HECTVT9L" target="_blank">https://confirm.udacity.com/HECTVT9L</a></p>
            </div>
            <div class="background"></div>
            <div class="background-2"></div>
        </div>

        <div class="certificate certificate-2 reverse">
            <div class="content">
                <h2>Python foundation Nanodegree</h2>
                <p class="from">from Udacity</p>
                <p class="proof-of-completion">confirmation : <a href="https://confirm.udacity.com/7DHS7GLD" target="_blank">https://confirm.udacity.com/7DHS7GLD</a></p>
            </div>
            <div  class="by">
                <img src="./udacityLogo.png" alt="udacity logo" height=75>
            </div>
            <div class="background"></div>
            <div class="background-2"></div>
        </div>

        <div class="certificate">
            <div  class="by">
                <img src="./udemyLogo.svg" alt="udemy logo" height=75>
            </div>
            <div class="content">
                <h2>Algorithmic Trading & Quantitative Analysis Using Python</h2>
                <p class="from">from Udemy</p>
                <p class="proof-of-completion">confirmation : <a href="https://www.udemy.com/certificate/UC-7fc8cb80-a47b-494e-baa2-7a45c7deb2dd/" target="_blank">https://www.udemy.com/certificate/UC-7fc8cb80-a47b-494e-baa2-7a45c7deb2dd/</a></p>
            </div>
            <div class="background"></div>
            <div class="background-2"></div>
        </div>
    </div>
</div>

<style>
    #certifications{
        margin-top: 140px;
        font-family: 'Josefin Sans', sans-serif;
        width: 100%;
    }
    

    h1{
        font-size: 3rem;
    }

    .certificate{
        position: relative;
        max-width: max-content;
        margin: 70px auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
    }

    .certificate .by{
        padding: 30px;
        margin-right: 30px;
        border-radius: 100px;
        background: rgb(26, 106, 180);
    }

    .certificate.certificate-2 .by{
        margin-left: 30px;
    }

    .certificate .content{
        max-width: max-content;
        padding: 30px 70px;
        padding-left: 0;
    }

    .certificate.certificate-2 .content{
        padding-left: 70px;
        padding-right: 0;
    }

    .certificate.certificate-2{
        color: white;
    }

    .certificate a{
        color: inherit;
        text-decoration: underline;
    }

    .certificate.reverse .background-2{
        clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%);
    }

    .certificate .background{
        position:absolute;
        left:0;
        top:0;
        width:100%;
        height:100%;
        background:darksalmon;
        z-index: -1;
        clip-path: polygon(10% 0, 100% 0%, 90% 100%, 0% 100%);
    }

    .certificate.certificate.reverse .background{
        clip-path:polygon(0 0, 90% 0, 100% 100%, 10% 100%);
    }

    .certificate.certificate-2 .background{
        background: #4300fb;
    }

    .certificate .background-2{
        position:absolute;
        left:5px;
        top:5px;
        width:100%;
        height:100%;
        background:rgb(26, 106, 180);
        z-index: -2;
        clip-path: polygon(10% 0, 100% 0%, 90% 100%, 0% 100%);
        transition: all 0.5s;
    }

    .certificate.certificate-2 .background-2{
        background:rgb(180, 26, 180);
        left:-5px;
        top:5px;
    }

    .certificate:hover .background-2{
        left:20px;
        top:20px;
    }

    .certificate.certificate-2:hover .background-2{
        left:-20px;
        top:20px;
    }
</style>