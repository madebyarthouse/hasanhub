import { useSearchParams, useTransition } from "@remix-run/react";
import type { TimeFilterOptions } from "~/components/filters";

const useFilterParams = () => {
    const transition = useTransition();
    const [searchParams] = useSearchParams();

    const durationFilter = (searchParams.getAll("duration") ?? ["all"]) as unknown as TimeFilterOptions[];
;
    const nextSearchParams = new URLSearchParams(transition.location?.search);
    const nextDurationFilter = nextSearchParams.getAll("duration") as unknown as TimeFilterOptions[];

    return {transitionState: transition.state, durationFilter, nextDurationFilter};
}

export default useFilterParams;