import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/sidebar.tsx", [
    index("routes/home.tsx"),
    route("transfer", "routes/transfer.tsx"),
    route("setting", "routes/setting.tsx"),
  ]),
] satisfies RouteConfig;
