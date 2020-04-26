import dynamic from "next/dynamic";

const DynamicMapPage = dynamic(() => import("../../components/locations.map"), {
  ssr: false,
});

export default () => <DynamicMapPage />;
