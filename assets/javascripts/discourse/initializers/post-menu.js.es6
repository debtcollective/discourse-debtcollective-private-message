import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "private-message-menu",
  initialize() {
    withPluginApi("0.8.9", api => {
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
        }
      });
    });
  }
};
