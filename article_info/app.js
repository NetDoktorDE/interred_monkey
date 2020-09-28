(function (window) {
    let version = "3.1";
    let appTemplate = `<style>
  .vue-monkey {
    display: none;
    z-index: 1000001;
    position: fixed; top: 0px; left: 0px;
    width: 100%; height: 100%;
    padding: 10px;
    font-family:Roboto, sans-serif; font-size:14px; -webkit-font-smoothing:antialiased; -webkit-tap-highlight-color:rgba(0, 0, 0, 0);
    pointer-events:none;
  }
  .vue-monkey .hidden {
    display: none;
  }
  .vue-monkey .shown {
    display: block;
  }
  .vue-monkey .closed-layer {
    margin-left: auto; margin-right: auto;
  }
  .vue-monkey .closed-layer .image {
    width: 50px;
    height: 50px;
    border-radius:50%;
    background-size: 50px 50px;
    display: block;
    pointer-events:auto;
  }
  .vue-monkey .closed-layer .image.standard {
    background-image: url('https://cdn.netdoktor.de/images/internal/ir-monkey.jpg');
  }
  .vue-monkey .closed-layer .image.campaign {
    background-image: url('https://cdn.netdoktor.de/images/internal/ir_monkey_gold.png');
  }
  .vue-monkey .closed-layer .id-label {
    pointer-events:auto;
    text-align: center;
    margin-top: 4px;
    width: 50px; height: 20px;
    background-color: rgba(255, 255, 255, 0.9);
    display: none;
  }
  .vue-monkey .closed-layer .id-label .id-text {
    pointer-events:auto;
    font-family:Roboto, sans-serif; font-size:10px; -webkit-font-smoothing:antialiased; -webkit-tap-highlight-color:rgba(0, 0, 0, 0);
  }
  .vue-monkey .open-layer {
    pointer-events:auto;
    background-color: rgba(255, 255, 255, 0.8);
    color: rgba(0, 0, 0, 0.8);
    margin-left: auto; margin-right: auto;
  }
  .vue-monkey .info-block {
    font-family:Roboto, sans-serif; line-height:18px; font-size: 14px; -webkit-font-smoothing:antialiased; -webkit-tap-highlight-color:rgba(0, 0, 0, 0);
    padding: 16px 16px 8px 16px;
  }
  .vue-monkey .info-block .title {
    font-weight: 600;
  }
  .vue-monkey .info-block .info-block-detail {
    padding: 8px 4px 0 4px;
  }
  .vue-monkey .info-block .info-block-detail .label {
    font-size: 12px;
    font-style: italic;
  }
  .vue-monkey .info-block .info-block-detail .value {
    padding-left: 8px;
  }
</style>
<div id="vue-monkey-app" class="vue-monkey" :style="{ display: mountDisplay }">
  <div class="closed-layer" :class="[isClosed ? 'shown' : 'hidden']">
    <div v-on:click="toggle" class="image" :class="{ standard: !isCampaign, campaign: isCampaign }"></div>
    <div v-on:click="copyContentId" class="id-label" :style="{ display: labelStyle }"><span class="id-text">{{message}}<span></div>
    <input type="hidden" id="coptToClipboard" :value="copyString">
  </div>
  <div class="open-layer" :class="[!isClosed ? 'shown' : 'hidden']" v-on:click="toggle">

    <info-block
      v-for="post in posts"
      v-bind:post="post"
    ></info-block>

  </div>
</div>`;

    let vueMonkeyApp = new Vue({
        data: {
            didMount: false,
            message: "",
            styleButtonBackground: "'https://cdn.netdoktor.de/images/internal/ir-monkey.jpg'",
            isCampaign: false,
            labelStyle: "none",
            isClosed: true,
            mountDisplay: "none",
            copyString: "",
            posts: [
            ],
        },
        mounted: function () {
            console.log("vue monkey mounted")

            // reference dataLayer
            var gtm = google_tag_manager["GTM-K9WTNF"];
            this.dataLayer = gtm.dataLayer;

            // page id
            this.message = contentId(this.dataLayer);

            // cs id
            this.isCampaign = isCampaignDataLayer(this.dataLayer);

            this.labelStyle = "block";
            this.mountDisplay = "block";

            metaInformation(this.dataLayer, this.posts);
            bfaInformation(this.dataLayer, this.posts);
            onPageformation(this.dataLayer, this.posts);

            this.posts.push({
            title: "Interred Monkey",
            info: [
                { label: "version", value: version },
                ]});
        },
        created: function () {
            console.log("vue monkey created");
        },
        methods: {
            toggle: function (event) {
                console.log("toggled");
                this.isClosed = !this.isClosed;
            },
            copyContentId: function (event) {
                this.copyString = this.message;
                let copyToClipboard = document.querySelector('#coptToClipboard');
                copyToClipboard.setAttribute('type', 'text');
                copyToClipboard.select();
                try {
                    var successful = document.execCommand('copy');
                    var msg = successful ? 'successful' : 'unsuccessful';
                    console.log('Id was copied ' + msg);
                } catch (err) {
                    console.log('Oops, unable to copy');
                }
                copyToClipboard.setAttribute('type', 'hidden');
                window.getSelection().removeAllRanges();
            }
        }
    });

    Vue.component('info-block', {
        props: ['post'],
        template: `<div class="info-block"><span class="title">{{ post.title }}</span><info-block-label v-for="info in post.info" v-bind:info="info"></info-block-label></div>`
    });

    Vue.component('info-block-label', {
        props: ['info'],
        template: `<div class="info-block-detail"><span class="label">{{ info.label }}:</span><span class="value">{{ info.value }}</span></div>`
    });

    function contentId(dataLayer) {
        if(dataLayer.get("page.pageType") == "interred") {
            return dataLayer.get("page.articleID");
        } else if(dataLayer.get("page.pageType") == "cms") {
            return "cms "+dataLayer.get("page.cmsPageId");
        }
        return "no id"
    }

    function isCampaignDataLayer(dataLayer) {
        return (dataLayer.get("page.content.csId") !== undefined) && (dataLayer.get("page.content.csId") != "")
    }

    function metaInformation(dataLayer, posts) {
        posts.push({
            title: "Meta info",
            info: [
                { label: "id", value: contentId(dataLayer) },
                { label: "last transfer", value: dataLayer.get("page.interredTimestamp") || "not set" },
                { label: "main topic", value: dataLayer.get("page.topic.mainFormatted") || "not set" },
                { label: "page type", value: dataLayer.get("page.pageType") || "not set" },
                { label: "interred type", value: dataLayer.get("page.articleType.interredType") || "not set" },
                { label: "article type", value: dataLayer.get("page.articleType.type") || "not set" },
                ]});
    }

    function bfaInformation(dataLayer, posts) {
        posts.push({
            title: "BFA info",
            info: [
                { label: "exclusive", value: dataLayer.get("page.content.bfa.campaignIsExclusive") ? "yes" "no" || "not set" },
                { label: "category", value: dataLayer.get("page.content.bfa.category") || "not set" },
                { label: "layout", value: dataLayer.get("page.content.bfa.layout") || "not set" },
                { label: "topics", value: dataLayer.get("page.content.bfa.topics") || "not set" },
                ]});
    }

    function onPageformation(dataLayer, posts) {
        //wordlink counter
        let wordlinkCount = document.getElementsByClassName("wlm-link").length;
        //image gallery counter
        let imageGalleryCount = document.getElementsByClassName("widget-image-gallery").length;
        //video counter
        let videoCount = document.getElementsByClassName("video with-description").length;
        //sc teaser counter
        let scTeaserCount = document.getElementsByClassName("ndpm-contentteaser-sc-container").length;
        //lvc teaser counter
        let lvcTeaserCount = document.getElementsByClassName("ndpm-contentteaser-lwc-container").length;
        //hpf teaser counter
        let hpfTeaserCount = document.getElementsByClassName("ndpm-contentteaser-hpf-container").length;
        //hpf teaser counter
        let ndtoolsTeaserCount = document.getElementsByClassName("ndpm-ndtools-wrapper").length;
        //qt/lvc counter
        let qtAndLvcCount = (document.getElementById("mini-sc") !== null) ? "1" : "0";

        posts.push({
            title: "OnPage info",
            info: [
                { label: "wordlinks", value: ""+wordlinkCount },
                { label: "image gallery", value: ""+imageGalleryCount },
                { label: "video", value: ""+videoCount },
                { label: "qt & lvc", value: ""+qtAndLvcCount },
                { label: "sc teaser", value: ""+scTeaserCount },
                { label: "lvc teaser", value: ""+lvcTeaserCount },
                { label: "hpf teaser", value: ""+hpfTeaserCount },
                { label: "nd tools teaser", value: ""+ndtoolsTeaserCount },
                ]});
    }

    window.vueMonkey = {
        isReady(successCallBack) {
            jq(document).ready(function(){
                successCallBack();
            });
        },
        appendToBody() {
            jq('body').append(appTemplate);
        },
        startApp() {
            this.appendToBody();
            setTimeout(() => {
                vueMonkeyApp.$mount('#vue-monkey-app');
            }, 1000);
        }
    };
})(window);