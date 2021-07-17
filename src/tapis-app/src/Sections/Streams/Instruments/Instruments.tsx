import { OnSelectCallback } from 'tapis-ui/components/streams/instruments/InstrumentList';
import { Config } from 'tapis-redux/types';
import { Streams } from '@tapis/tapis-typescript';
import { InstrumentList } from "tapis-ui/components/streams";
import { InstrumentsListCallback } from 'tapis-redux/streams/instruments/types';
import { default as Measurements } from "../Measurements";
import { default as Variables } from "../Variables";
import { ListSectionListFull, ListSection, ListSectionBody, ListSectionHeader, ListSectionDetailHalf } from 'tapis-app/Sections/ListSection';
import { Icon } from 'tapis-ui/_common';

interface InstrumentsProps  {
  project: Streams.Project,
  site: Streams.Site,
  config?: Config,
  onList?: InstrumentsListCallback,
  onSelect?: OnSelectCallback,
  selected?: Streams.Instrument,
  refresh?: () => void
}

const Projects: React.FC<InstrumentsProps> = ({ project, site, config, onList, onSelect, selected, refresh }) => {

  return (
    <ListSection>
        <ListSectionHeader>
            <div>
                Instrument List
                &nbsp;
                <span className="btn-head" onClick={refresh}>
                    <Icon name="refresh" />
                </span>
            </div>
        </ListSectionHeader>
        <ListSectionBody>
        {
          site && project
          ?
          <>
            <ListSectionListFull>
              <InstrumentList projectId={project.project_name} siteId={site.site_id} config={config} onList={onList} onSelect={onSelect} selected={selected} />
            </ListSectionListFull>
            <ListSectionDetailHalf>
              <ListSectionHeader type={"sub-header"}>Measurements</ListSectionHeader>
              <Measurements config={config} project={project} site={site} instrument={selected} />
            </ListSectionDetailHalf>
            <ListSectionDetailHalf>
              <ListSectionHeader type={"sub-header"}>Variables</ListSectionHeader>
              <Variables config={config} project={project} site={site} instrument={selected} />
            </ListSectionDetailHalf>
          </>
          : <div>No selected site</div>
        }
        </ListSectionBody>
    </ListSection>

      

  );
}

export default Projects;