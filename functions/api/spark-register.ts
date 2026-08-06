import { handleLead } from "./_lead";

export const onRequestPost = (context: Parameters<typeof handleLead>[0]) => handleLead(context, "spark-register");
