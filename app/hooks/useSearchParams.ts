import { useSearchParams, useTransition } from "@remix-run/react";

const useFilterParams = () => {
    const transition = useTransition();
    const [searchParams] = useSearchParams();

    const durationFilter = searchParams.get("duration") ?? "all";
;
    const nextSearchParams = new URLSearchParams(transition.location?.search);
    const nextDurationFilter = nextSearchParams.get("duration");

    return {transitionState: transition.state, durationFilter, nextDurationFilter};
}

export default useFilterParams;