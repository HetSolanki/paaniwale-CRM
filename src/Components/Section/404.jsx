import { Link } from "react-router-dom";

import ErrorImage from "@/assets/404-2.svg";
import { Button } from "../UI/shadcn-UI/button";
function Error() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center py-10 dark:bg-slate-900">
      <img src={ErrorImage} width={400} alt="" />
      <div className="max-w-[546px] mx-auto w-full mt-12">
        <h4 className="text-slate-900 mb-4">Page not found</h4>
        <div className="dark:text-white text-base font-normal mb-10">
          The page you are looking for might have been removed had its name
          changed or is temporarily unavailable.
        </div>
      </div>
      <Link to="/" className="btn btn-dark dark:bg-slate-800 block text-center">
        <Button className="max-w-[300px] mx-auto w-full">Go to homepage</Button>
      </Link>
    </div>
  );
}

export default Error;
