import { withPluginApi } from "discourse/lib/plugin-api";
import { iconNode } from "discourse-common/lib/icon-library";
import { h } from "virtual-dom";
import { dateNode } from "discourse/helpers/node";

export default {
  name: "private-message-menu",
  initialize() {
    withPluginApi("0.8.9", api => {
      /**
       * Reopen widget to render different menuItems
       * when the topic is a private message
       *  */
      api.reopenWidget("post-menu", {
        menuItems() {
          const post = this.findAncestorModel();
          const topicArchetype = post.get("topic.archetype");
          const isPrivateMessage = topicArchetype === "private_message";

          let result = this.siteSettings.post_menu.split("|");

          if (isPrivateMessage) {
            result = this.siteSettings.private_message_menu.split("|");
          }

          return result;
        },
      });

      /**
       * Reopen widget to remove share attributes in Private Messages
       */
      api.reopenWidget("post-meta-data", {
        html(attrs) {
          function showReplyTab(attrs, siteSettings) {
            return (
              attrs.replyToUsername &&
              (!attrs.replyDirectlyAbove ||
                !siteSettings.suppress_reply_directly_above)
            );
          }

          let postInfo = [];

          if (attrs.isWhisper) {
            postInfo.push(
              h(
                "div.post-info.whisper",
                {
                  attributes: { title: I18n.t("post.whisper") },
                },
                iconNode("eye-slash")
              )
            );
          }

          const post = this.findAncestorModel();
          const topicArchetype = post.get("topic.archetype");
          const isPrivateMessage = topicArchetype === "private_message";
          const lastWikiEdit =
            attrs.wiki && attrs.lastWikiEdit && new Date(attrs.lastWikiEdit);
          const createdAt = new Date(attrs.created_at);
          const date = lastWikiEdit
            ? dateNode(lastWikiEdit)
            : dateNode(createdAt);

          const attributes = {
            class: "post-date",
            "data-post-number": attrs.post_number,
          };

          if (!isPrivateMessage) {
            _.merge(attributes, {
              href: attrs.shareUrl,
              "data-share-url": attrs.shareUrl,
            });
          }

          if (lastWikiEdit) {
            attributes["class"] += " last-wiki-edit";
          }

          if (attrs.via_email) {
            postInfo.push(this.attach("post-email-indicator", attrs));
          }

          if (attrs.locked) {
            postInfo.push(this.attach("post-locked-indicator", attrs));
          }

          if (attrs.version > 1 || attrs.wiki) {
            postInfo.push(this.attach("post-edits-indicator", attrs));
          }

          if (attrs.multiSelect) {
            postInfo.push(this.attach("select-post", attrs));
          }

          if (showReplyTab(attrs, this.siteSettings)) {
            postInfo.push(this.attach("reply-to-tab", attrs));
          }

          postInfo.push(
            h("div.post-info.post-date", h("a", { attributes }, date))
          );

          postInfo.push(
            h(
              "div.read-state",
              {
                className: attrs.read ? "read" : null,
                attributes: {
                  title: I18n.t("post.unread"),
                },
              },
              iconNode("circle")
            )
          );

          let result = [];
          if (this.settings.displayPosterName) {
            result.push(this.attach("poster-name", attrs));
          }
          result.push(h("div.post-infos", postInfo));

          return result;
        },
      });
    });
  },
};
